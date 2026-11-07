export async function quoteApi<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok || !payload || payload.error) throw new Error(payload?.error || "quote_unavailable");
  return payload;
}

function tusMetadata(value: string): string {
  const bytes = new TextEncoder().encode(value);
  return btoa(String.fromCharCode(...bytes));
}

export async function uploadSignedFile(
  file: File,
  authorization: { uploadEndpoint: string; uploadPath: string; uploadToken: string },
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const endpoint = new URL(authorization.uploadEndpoint);
  if (endpoint.protocol !== "https:" || !/^[a-z0-9-]+\.storage\.supabase\.co$/.test(endpoint.hostname) ||
      endpoint.pathname !== "/storage/v1/upload/resumable/sign") throw new Error("quote_upload_unavailable");
  const headers = { "Tus-Resumable": "1.0.0", "x-signature": authorization.uploadToken, "x-upsert": "false" };
  const metadata = [
    ["bucketName", "quote-intake"], ["objectName", authorization.uploadPath],
    ["contentType", file.type || "application/octet-stream"], ["cacheControl", "0"],
  ].map(([key, value]) => `${key} ${tusMetadata(value)}`).join(",");
  const created = await fetcher(endpoint.href, {
    method: "POST", headers: { ...headers, "Upload-Length": String(file.size), "Upload-Metadata": metadata },
    cache: "no-store", redirect: "error",
  });
  if (created.status !== 201) throw new Error("quote_upload_unavailable");
  const location = created.headers.get("location");
  if (!location) throw new Error("quote_upload_unavailable");
  const uploadUrl = new URL(location, endpoint);
  const apiOrigin = endpoint.origin.replace(".storage.supabase.co", ".supabase.co");
  if (![endpoint.origin, apiOrigin].includes(uploadUrl.origin) ||
      !uploadUrl.pathname.startsWith("/storage/v1/upload/resumable/sign/") ||
      uploadUrl.username || uploadUrl.password) throw new Error("quote_upload_unavailable");

  async function currentOffset(): Promise<number> {
    const response = await fetcher(uploadUrl.href, { method: "HEAD", headers, cache: "no-store", redirect: "error" });
    const rawOffset = response.headers.get("upload-offset");
    const offset = rawOffset !== null && /^\d+$/.test(rawOffset) ? Number(rawOffset) : NaN;
    if (!response.ok || !Number.isSafeInteger(offset) || offset < 0 || offset > file.size) {
      throw new Error("quote_upload_unavailable");
    }
    return offset;
  }

  let offset = await currentOffset();
  let retries = 0;
  while (offset < file.size) {
    const next = Math.min(offset + 6 * 1024 * 1024, file.size);
    try {
      const response = await fetcher(uploadUrl.href, {
        method: "PATCH",
        headers: { ...headers, "Upload-Offset": String(offset), "Content-Type": "application/offset+octet-stream" },
        body: file.slice(offset, next), cache: "no-store", redirect: "error",
      });
      const rawOffset = response.headers.get("upload-offset");
      if (response.status !== 204 || rawOffset === null || !/^\d+$/.test(rawOffset) ||
          Number(rawOffset) !== next) {
        throw new Error("quote_upload_unavailable");
      }
      offset = next;
      retries = 0;
    } catch {
      if (++retries > 3) throw new Error("quote_upload_unavailable");
      offset = await currentOffset();
    }
  }
}
