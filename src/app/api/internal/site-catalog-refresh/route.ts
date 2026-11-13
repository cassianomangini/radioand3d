import { timingSafeEqual } from "node:crypto";
import { syncSiteCatalog } from "@/server/products/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(value: string | null): boolean {
  const secret = process.env.CRON_SECRET?.trim() ?? "";
  if (secret.length < 32 || !value?.startsWith("Bearer ")) return false;
  const left = Buffer.from(value.slice(7), "utf8");
  const right = Buffer.from(secret, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function response(body: object, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "private, no-store", "x-content-type-options": "nosniff" },
  });
}

/** Server-only refresh. Public requests cannot invoke or reconfigure it. */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return response({ error: "forbidden" }, 403);
  }
  try {
    const catalog = await syncSiteCatalog();
    if (catalog.state !== "available") return response({ error: "catalog_unavailable" }, 503);
    return response({ ok: true, count: catalog.products.length }, 200);
  } catch (error) {
    console.error("[cm3d-catalog] scheduled_refresh_failed",
      error instanceof Error ? error.name : "");
    return response({ error: "catalog_refresh_failed" }, 503);
  }
}
