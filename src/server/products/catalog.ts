import { parseCatalogResponse, type CatalogProduct } from "@/features/products/catalog-contract";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type CatalogRead =
  | { state: "available"; products: CatalogProduct[]; preview?: boolean }
  | { state: "unavailable"; products: [] };

const REVALIDATE_SECONDS = 15 * 60;

export async function getSiteCatalog(): Promise<CatalogRead> {
  if (process.env.NODE_ENV === "development") {
    try {
      const raw = await readFile(join(process.cwd(), "src/server/products/active-catalog-preview.json"), "utf8");
      const rows = JSON.parse(raw) as Array<{
        id: number; slug: string; name: string; summary: string; description: string;
        imageUrls: string[]; variations: string[]; material: string | null;
        dimensions: string | null; sourceSyncedAt: string;
      }>;
      const products = parseCatalogResponse({ products: rows.map((row) => ({
        slug: row.slug, name: row.name, summary: row.summary, description: row.description,
        categorySlug: null, seoTitle: row.name, seoDescription: row.summary,
        shopeeUrl: `https://shopee.com.br/product/1433140862/${row.id}`,
        imageUrls: row.imageUrls, material: row.material, dimensions: row.dimensions,
        customizable: false, variations: row.variations,
        sourceStatus: "NORMAL", sourceSyncedAt: row.sourceSyncedAt, contentUpdatedAt: row.sourceSyncedAt,
      })) });
      if (products) return { state: "available", products, preview: true };
    } catch { /* Prévia local ausente: seguir com o catálogo configurado. */ }
  }
  const endpoint = process.env.CM_SITE_CATALOG_API_URL?.trim();
  const token = process.env.CM_SITE_CATALOG_TOKEN?.trim();
  if (!endpoint || !token || token.length < 32) return { state: "unavailable", products: [] };

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password
      || url.search || url.hash || !url.pathname.endsWith("/api/internal/site-catalog")) {
      return { state: "unavailable", products: [] };
    }
  } catch {
    return { state: "unavailable", products: [] };
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS, tags: ["site-catalog"] },
    });
    if (!response.ok) return { state: "unavailable", products: [] };
    const products = parseCatalogResponse(await response.json());
    return products ? { state: "available", products } : { state: "unavailable", products: [] };
  } catch {
    return { state: "unavailable", products: [] };
  }
}
