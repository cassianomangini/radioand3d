/**
 * Refresh the Studio carousel manifest from the images in the R2 carrossel bucket.
 * The manifest contains object names only; the image bytes stay in R2.
 */
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(path.join(repository, ".env.local"))) {
  process.loadEnvFile(path.join(repository, ".env.local"));
}

const endpoint = process.env.R2_S3_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("R2_S3_ENDPOINT and read-only R2 credentials are required.");
}

const bucket = "carrossel";
const manifestPath = path.join(repository, "src", "features", "studio", "prints-media.json");
const imageTypes = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
// Exact content hashes of the thirteen photos previously shipped with the local carousel.
// Ten of them also exist in R2 and must not reappear after the local copies are removed.
const legacyCarouselHashes = new Set([
  "f381f13d2e254bc97e25e716a3fb4bd8",
  "f1db58d9838aee646c3f497da9e08ae2",
  "bdc64085d32d1c9ba7b225e4639798e1",
  "b15173ea30e264ae2c43c210566bb915",
  "53df3925fb9906ab95ca282f0cd29517",
  "c4ac5acd86982f8acc0bcb3cd35522cf",
  "aeb3f17ba400cf76cb182d0d1d0042f6",
  "b6cb18b91f43a7a73f1ca06ead000ae7",
  "623cb7f40017e97dac3acd81d8d7aa0a",
  "03c732c523738c84cf88df93e0825843",
  "9d4eb97c1d78f246a449714d9c4422d1",
  "00d8dac4e76eb91e6b147435ba9cc67d",
  "349f2e8d72b1fe1400205752d4282139"
]);
const client = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey }
});

try {
  const objects = [];
  let continuationToken;
  do {
    const page = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000
    }));
    objects.push(...(page.Contents ?? []));
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  const browserImages = objects
    .filter((object) => object.Key && object.Size && imageTypes.has(path.extname(object.Key).toLowerCase()));
  const images = browserImages
    .filter((object) => !legacyCarouselHashes.has((object.ETag ?? "").replaceAll('"', "").toLowerCase()))
    .sort((a, b) => a.Key.localeCompare(b.Key, "pt-BR", { numeric: true }));

  const items = images.map((object) => {
    const key = object.Key;
    const version = object.ETag?.replaceAll('"', "") ?? String(object.LastModified?.getTime() ?? 0);
    const id = createHash("sha256").update(key).update("\0").update(version).digest("hex").slice(0, 20);
    const title = path.basename(key, path.extname(key)).replace(/[_-]+/g, " ").trim();
    return {
      id,
      project: id,
      kind: "image",
      src: `/api/studio/prints/${id}`,
      r2Key: key,
      title,
      alt: `Imagem do Estúdio: ${title}`
    };
  });

  if (items.length === 0) throw new Error("No browser-compatible images found in R2 carrossel.");
  await writeFile(manifestPath, JSON.stringify({ items }, null, 2) + "\n");
  console.log(`Studio carousel: ${items.length} images from R2 carrossel.`);
  const legacyCount = browserImages.length - images.length;
  if (legacyCount) console.log(`${legacyCount} former local-carousel photos excluded.`);
  const unsupportedCount = objects.length - browserImages.length;
  if (unsupportedCount) console.log(`${unsupportedCount} unsupported objects skipped (including HEIC).`);
} finally {
  client.destroy();
}
