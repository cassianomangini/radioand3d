import { createHash, createHmac } from "node:crypto";
import { parseCatalogResponse, type CatalogProduct } from "@/features/products/catalog-contract";

const OBJECT_KEY = "cmangini3d/site-catalog/public-v1.json";
const MAX_SNAPSHOT_BYTES = 3_000_000;
const R2_TIMEOUT_MS = 8_000;

export type StoredCatalog = {
  savedAt: string;
  products: CatalogProduct[];
  etag: string;
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function mac(key: string | Buffer, value: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

function storageConfig() {
  const endpoint = process.env.R2_S3_ENDPOINT?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const accessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !bucket || !accessKey || !secretKey) throw new Error("catalog_storage_unconfigured");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".r2.cloudflarestorage.com")
    || url.pathname !== "/" || url.search || url.hash || url.username || url.password
    || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new Error("catalog_storage_invalid_endpoint");
  }
  return { endpoint: url.origin, host: url.host, bucket, accessKey, secretKey };
}

function signRequest(
  method: "GET" | "PUT", body: string, condition?: { name: "if-match" | "if-none-match"; value: string },
) {
  const config = storageConfig();
  const pathname = "/" + config.bucket + "/" + OBJECT_KEY;
  const payloadHash = digest(body);
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = timestamp.slice(0, 8);
  const scope = day + "/auto/s3/aws4_request";
  const headers: Record<string, string> = {
    host: config.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": timestamp,
  };
  if (method === "PUT") headers["content-type"] = "application/json";
  if (condition) headers[condition.name] = condition.value;

  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((name) => name + ":" + headers[name].trim() + "\n").join("");
  const canonicalRequest = [
    method, pathname, "", canonicalHeaders, names.join(";"), payloadHash,
  ].join("\n");
  const signingKey = mac(mac(mac(mac("AWS4" + config.secretKey, day), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey)
    .update("AWS4-HMAC-SHA256\n" + timestamp + "\n" + scope + "\n" + digest(canonicalRequest))
    .digest("hex");
  const { host: _host, ...wireHeaders } = headers;
  return {
    url: config.endpoint + pathname,
    headers: {
      ...wireHeaders,
      authorization: "AWS4-HMAC-SHA256 Credential=" + config.accessKey + "/" + scope
        + ", SignedHeaders=" + names.join(";") + ", Signature=" + signature,
    },
  };
}

function assertSnapshot(value: unknown): { savedAt: string; products: CatalogProduct[] } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("catalog_storage_invalid_snapshot");
  }
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || typeof record.savedAt !== "string"
    || !Number.isFinite(Date.parse(record.savedAt))) {
    throw new Error("catalog_storage_invalid_snapshot");
  }
  const products = parseCatalogResponse({ products: record.products });
  if (!products) throw new Error("catalog_storage_invalid_snapshot");
  return { savedAt: record.savedAt, products };
}

/** R2 stores only the PUBLIC site catalog contract, not Admin internals. */
export async function readStoredCatalog(fetcher: typeof fetch = fetch): Promise<StoredCatalog | null> {
  const request = signRequest("GET", "");
  const response = await fetcher(request.url, {
    headers: request.headers,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(R2_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("catalog_storage_read_" + response.status);
  const size = Number(response.headers.get("content-length"));
  if (Number.isFinite(size) && size > MAX_SNAPSHOT_BYTES) {
    throw new Error("catalog_storage_oversize");
  }
  const raw = await response.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_SNAPSHOT_BYTES) {
    throw new Error("catalog_storage_oversize");
  }
  const parsed = assertSnapshot(JSON.parse(raw));
  const etag = response.headers.get("etag");
  if (!etag || !/^"[A-Fa-f0-9]{32,64}"$/.test(etag)) {
    throw new Error("catalog_storage_missing_etag");
  }
  return { ...parsed, etag };
}

/**
 * Atomic compare-and-swap ensures concurrent refreshes never overwrite an
 * unseen R2 revision. 412 signals another writer won: read its snapshot.
 */
export async function writeStoredCatalog(
  products: CatalogProduct[], previousEtag: string | null, fetcher: typeof fetch = fetch,
): Promise<"written" | "conflict"> {
  const parsed = parseCatalogResponse({ products });
  if (!parsed) throw new Error("catalog_storage_invalid_projection");
  const body = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), products: parsed });
  if (Buffer.byteLength(body, "utf8") > MAX_SNAPSHOT_BYTES) throw new Error("catalog_storage_oversize");
  if (previousEtag !== null && !/^"[A-Fa-f0-9]{32,64}"$/.test(previousEtag)) {
    throw new Error("catalog_storage_invalid_etag");
  }
  const request = signRequest("PUT", body, {
    name: previousEtag === null ? "if-none-match" : "if-match",
    value: previousEtag ?? "*",
  });
  const response = await fetcher(request.url, {
    method: "PUT",
    headers: request.headers,
    body,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(R2_TIMEOUT_MS),
  });
  if (response.status === 412) return "conflict";
  if (!response.ok) throw new Error("catalog_storage_write_" + response.status);
  return "written";
}
