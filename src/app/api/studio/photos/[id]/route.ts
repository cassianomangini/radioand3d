import { fetchStudioPhoto, studioPhotoKeyFromId } from "@/features/studio/r2-photos";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let key: string | null;
  try {
    key = studioPhotoKeyFromId(id);
  } catch {
    return new Response(null, { status: 503 });
  }
  if (!key) return new Response(null, { status: 404 });

  try {
    const object = await fetchStudioPhoto(key);
    if (object.status === 404) return new Response(null, { status: 404 });
    if (!object.ok || !object.body) return new Response(null, { status: 502 });

    const extension = key.split(".").at(-1)?.toLowerCase();
    const contentType = extension === "png" ? "image/png"
      : extension === "webp" ? "image/webp"
      : extension === "avif" ? "image/avif"
      : "image/jpeg";
    const contentLength = object.headers.get("content-length");

    return new Response(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        ...(contentLength ? { "Content-Length": contentLength } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
