import { parseCatalogResponse, type CatalogProduct } from "@/features/products/catalog-contract";

export type CatalogRead =
  | { state: "available"; products: CatalogProduct[] }
  | { state: "unavailable"; products: [] };

const REVALIDATE_SECONDS = 15 * 60;

export async function getSiteCatalog(): Promise<CatalogRead> {
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
