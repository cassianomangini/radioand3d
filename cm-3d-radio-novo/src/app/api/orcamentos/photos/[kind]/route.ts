import { fetchStudioPhoto } from "@/features/studio/r2-photos";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  const key = kind === "caixa" ? "Caixas/28.png"
    : kind === "placa" ? "Decoração/6.png"
    : null;
  if (!key) return new Response(null, { status: 404 });

  try {
    const object = await fetchStudioPhoto(key);
    if (object.status === 404) return new Response(null, { status: 404 });
    if (!object.ok || !object.body) return new Response(null, { status: 502 });
    const contentLength = object.headers.get("content-length");
    return new Response(object.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        ...(contentLength ? { "Content-Length": contentLength } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
