import { parseCatalogResponse, type CatalogProduct } from "@/features/products/catalog-contract";
import {
  CATALOG_SOURCE_MAX_PAGES, CATALOG_SHOP_ID, parseCatalogSourcePage, type SourceItem,
} from "@/features/products/catalog-source-contract";
import {
  buildSiteCatalog, type SiteEditorialSeed,
} from "@/features/products/catalog-source-editorial";
import snapshotRows from "./published-catalog-snapshot.json";

export type CatalogRead =
  | { state: "available"; products: CatalogProduct[] }
  | { state: "unavailable"; products: [] };

const REVALIDATE_SECONDS = 15 * 60;
const FETCH_TIMEOUT_MS = 12_000;
const editorialSeeds: SiteEditorialSeed[] = snapshotRows;

const snapshotProducts = parseCatalogResponse({ products: editorialSeeds.map((row) => ({
  slug: row.slug,
  name: row.name,
  summary: row.summary,
  description: row.description,
  categorySlug: null,
  seoTitle: row.name,
  seoDescription: row.summary,
  shopeeUrl: "https://shopee.com.br/product/" + CATALOG_SHOP_ID + "/" + row.id,
  imageUrls: row.imageUrls,
  material: row.material,
  dimensions: row.dimensions,
  customizable: false,
  variations: row.variations,
  sourceStatus: "NORMAL",
  sourceSyncedAt: row.sourceSyncedAt,
  contentUpdatedAt: row.sourceSyncedAt,
})) });

function publishedSnapshot(): CatalogRead {
  return snapshotProducts
    ? { state: "available", products: snapshotProducts }
    : { state: "unavailable", products: [] };
}

function sourceEndpoint(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password
      || url.search || url.hash || url.port
      || !url.pathname.endsWith("/api/internal/site-catalog")) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchSourceCatalog(endpoint: URL, token: string): Promise<SourceItem[]> {
  const items: SourceItem[] = [];
  let cursor = 0;
  for (let page = 0; page < CATALOG_SOURCE_MAX_PAGES; page++) {
    const url = new URL(endpoint);
    if (cursor) url.searchParams.set("after", String(cursor));

    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS, tags: ["site-catalog-source"] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("catalog_source_http_" + response.status);

    const result = parseCatalogSourcePage(await response.json(), cursor);
    if (!result) throw new Error("catalog_source_invalid_page");
    items.push(...result.items);

    if (!result.hasMore) return items;
    if (!result.nextCursor || result.nextCursor <= cursor) {
      throw new Error("catalog_source_cursor_stalled");
    }
    cursor = result.nextCursor;
  }
  throw new Error("catalog_source_page_limit");
}

/**
 * Admin supplies only facts. The site's editable editorial copy/URLs survive
 * source changes. New simple items can pass the site's conservative quality
 * gate; auto-indexing remains a separate explicit rollout flag.
 */
export async function getSiteCatalog(): Promise<CatalogRead> {
  const endpoint = process.env.CM_SITE_CATALOG_API_URL?.trim();
  const token = process.env.CM_SITE_CATALOG_TOKEN?.trim();

  // Until the integration is provisioned, preserve the already-published site.
  if (!endpoint && !token) return publishedSnapshot();

  // Partial/malformed configuration must not silently be treated as a snapshot.
  if (!endpoint || !token || token.length < 32) return { state: "unavailable", products: [] };
  const url = sourceEndpoint(endpoint);
  if (!url) return { state: "unavailable", products: [] };

  try {
    const source = await fetchSourceCatalog(url, token);
    const products = parseCatalogResponse({ products: buildSiteCatalog(source, editorialSeeds, {
      now: Date.now(),
      autoIndex: process.env.CM_SITE_AUTO_INDEX_ENABLED === "true",
    }) });
    if (!products) throw new Error("catalog_source_invalid_projection");
    return { state: "available", products };
  } catch (error) {
    // Keep details/sitemap as 5xx on upstream failure rather than respond 200
    // with products silently deleted or an old purchasable status.
    console.error("[cm3d-catalog] source unavailable:", error instanceof Error ? error.message : "unknown");
    return { state: "unavailable", products: [] };
  }
}
