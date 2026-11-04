import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { unstable_cache } from "next/cache";
import snapshot from "@/app/estudio/studio-r2-media.json";

export type StudioR2Photo = { key: string; revision: string };

const bucket = "carrossel";
const emptyHash = createHash("sha256").update("").digest("hex");
const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
const imageExtension = /\.(?:jpe?g|png|webp|avif)$/i;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function r2Config() {
  const endpoint = process.env.R2_S3_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Configuração de leitura do R2 ausente.");
  }
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error("O endpoint do R2 precisa usar HTTPS.");
  return { origin: url.origin, host: url.host, accessKeyId, secretAccessKey };
}

function signedR2Request(pathname: string, query = "") {
  const { origin, host, accessKeyId, secretAccessKey } = r2Config();
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = timestamp.slice(0, 8);
  const scope = `${day}/auto/s3/aws4_request`;
  const canonicalRequest = [
    "GET",
    pathname,
    query,
    `host:${host}\nx-amz-content-sha256:${emptyHash}\nx-amz-date:${timestamp}\n`,
    signedHeaders,
    emptyHash,
  ].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, day), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey)
    .update(`AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${sha256(canonicalRequest)}`)
    .digest("hex");

  return {
    url: `${origin}${pathname}${query ? `?${query}` : ""}`,
    headers: {
      "x-amz-date": timestamp,
      "x-amz-content-sha256": emptyHash,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

function xmlValue(xml: string, tag: string) {
  const value = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "";
  return value.replace(/&(?:amp|lt|gt|quot|apos);|&#(?:\d+|x[\da-f]+);/gi, (entity) => {
    const named: Record<string, string> = {
      "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
    };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const hex = entity.startsWith("&#x") || entity.startsWith("&#X");
    const codePoint = Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
  });
}

async function listStudioPhotos(): Promise<StudioR2Photo[]> {
  const photos = new Map<string, StudioR2Photo>();
  const seenTokens = new Set<string>();
  let continuationToken: string | undefined;

  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const query = [
      ["list-type", "2"],
      ["max-keys", "1000"],
      ...(continuationToken ? [["continuation-token", continuationToken]] : []),
    ]
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
      .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
      .join("&");
    const signed = signedR2Request(`/${bucket}`, query);
    const response = await fetch(signed.url, { headers: signed.headers, cache: "no-store" });
    if (!response.ok) throw new Error(`Falha ao listar as fotos do R2: ${response.status}`);
    const xml = await response.text();

    for (const match of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const object = match[1];
      const key = xmlValue(object, "Key");
      const size = Number(xmlValue(object, "Size"));
      if (!key || !imageExtension.test(key) || !Number.isFinite(size) || size <= 0) continue;
      const etag = xmlValue(object, "ETag").replaceAll('"', "").toLowerCase();
      const revision = /^[a-f0-9]{32}$/.test(etag) ? etag : sha256(etag || key).slice(0, 32);
      photos.set(key, { key, revision });
    }

    if (xmlValue(xml, "IsTruncated") !== "true") {
      if (!photos.size) throw new Error("Nenhuma foto compatível encontrada no R2.");
      return [...photos.values()].sort((a, b) => a.key.localeCompare(b.key, "pt-BR", { numeric: true }));
    }
    const nextToken = xmlValue(xml, "NextContinuationToken");
    if (!nextToken || seenTokens.has(nextToken)) throw new Error("Paginação incompleta do R2.");
    seenTokens.add(nextToken);
    continuationToken = nextToken;
  }

  throw new Error("O inventário do R2 excedeu o limite de páginas esperado.");
}

const cachedStudioPhotos = unstable_cache(listStudioPhotos, ["studio-r2-photos-v1"], { revalidate: 60 });

export async function getStudioPhotos(): Promise<StudioR2Photo[]> {
  try {
    return await cachedStudioPhotos();
  } catch (error) {
    console.error("Falha ao atualizar as fotos do Estúdio no R2:", error);
    return snapshot;
  }
}

function photoSignature(encodedKey: string, revision: string) {
  const secret = r2Config().secretAccessKey;
  return createHmac("sha256", secret).update(`studio-photo-v1:${encodedKey}.${revision}`).digest("hex").slice(0, 32);
}

export function studioPhotoSrc(photo: StudioR2Photo) {
  const encodedKey = Buffer.from(photo.key, "utf8").toString("base64url");
  return `/api/studio/photos/${encodedKey}.${photo.revision}.${photoSignature(encodedKey, photo.revision)}`;
}

export function studioPhotoKeyFromId(id: string) {
  const match = /^([A-Za-z0-9_-]+)\.([a-f0-9]{32})\.([a-f0-9]{32})$/.exec(id);
  if (!match) return null;
  const expected = Buffer.from(photoSignature(match[1], match[2]), "hex");
  const received = Buffer.from(match[3], "hex");
  if (!timingSafeEqual(expected, received)) return null;
  const key = Buffer.from(match[1], "base64url").toString("utf8");
  return key && !key.startsWith("/") && !key.includes("\0") && imageExtension.test(key) ? key : null;
}

export async function fetchStudioPhoto(key: string) {
  const pathname = `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const signed = signedR2Request(pathname);
  return fetch(signed.url, { headers: signed.headers, cache: "no-store" });
}
