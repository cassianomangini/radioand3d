import { after } from "next/server";
import { parseCatalogResponse, type CatalogProduct } from "@/features/products/catalog-contract";
import {
  CATALOG_SOURCE_MAX_PAGES, CATALOG_SHOP_ID, parseCatalogSourcePage, type SourceItem,
} from "@/features/products/catalog-source-contract";
import {
  buildSiteCatalog, type SiteEditorialSeed,
} from "@/features/products/catalog-source-editorial";
import {
  readStoredCatalog, writeStoredCatalog, type StoredCatalog,
} from "./catalog-snapshot-store";
import snapshotRows from "./published-catalog-snapshot.json";

export type CatalogRead =
  | { state: "available"; products: CatalogProduct[]; degraded?: boolean }
  | { state: "unavailable"; products: [] };

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
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

function publishedSnapshot(degraded = false): CatalogRead {
  return snapshotProducts
    ? { state: "available", products: snapshotProducts, degraded }
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

function configuredSource(): { endpoint: URL; token: string } | null {
  const token = process.env.CM_SITE_CATALOG_TOKEN?.trim() ?? "";
  const endpoint = sourceEndpoint(process.env.CM_SITE_CATALOG_API_URL?.trim() ?? "");
  return token.length >= 32 && endpoint ? { endpoint, token } : null;
}

async function fetchSourceCatalog(endpoint: URL, token: string): Promise<SourceItem[]> {
  const items: SourceItem[] = [];
  let cursor = 0;
  for (let page = 0; page < CATALOG_SOURCE_MAX_PAGES; page++) {
    const url = new URL(endpoint);
    if (cursor) url.searchParams.set("after", String(cursor));

    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
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
 * Always apply the current site-owned editorial copy, even when an older
 * operational snapshot was written before a deploy changed the copy.
 */
function productsFromStored(stored: StoredCatalog): CatalogProduct[] {
  if (!snapshotProducts) throw new Error("catalog_editorial_baseline_invalid");
  const bySlug = new Map(stored.products.map((item) => [item.slug, item]));
  if (bySlug.size !== stored.products.length) throw new Error("catalog_storage_duplicate_slugs");

  const known = snapshotProducts.map((seed) => {
    const value = bySlug.get(seed.slug);
    if (!value) throw new Error("catalog_storage_missing_legacy");
    return {
      ...value,
      name: seed.name,
      summary: seed.summary,
      description: seed.description,
      seoTitle: seed.seoTitle,
      seoDescription: seed.seoDescription,
      categorySlug: seed.categorySlug,
      autoIndexEligible: false,
    };
  });

  const newProducts = stored.products
    .filter((item) => !snapshotProducts.some((seed) => seed.slug === item.slug))
    .map((product) => ({
      ...product,
      autoIndexEligible: process.env.CM_SITE_AUTO_INDEX_ENABLED === "true"
        && product.autoIndexEligible === true,
    }));

  const parsed = parseCatalogResponse({ products: [...known, ...newProducts] });
  if (!parsed) throw new Error("catalog_storage_invalid_projection");
  return parsed;
}

function warn(reason: string, error?: unknown): void {
  // Never log tokens, raw provider payloads, or R2 request URLs.
  console.error("[cm3d-catalog] " + reason,
    error instanceof Error ? error.name : "");
}

/**
 * A catalog becomes visible only after a successful durable R2 write.
 * On an atomic write conflict another refresh already committed a snapshot.
 */
async function refreshAndPersist(previous: StoredCatalog | null): Promise<CatalogRead> {
  const config = configuredSource();
  if (!config) throw new Error("catalog_source_unconfigured");
  const source = await fetchSourceCatalog(config.endpoint, config.token);
  const proposed = parseCatalogResponse({ products: buildSiteCatalog(source, editorialSeeds, {
    now: Date.now(),
    autoIndex: process.env.CM_SITE_AUTO_INDEX_ENABLED === "true",
  }) });
  if (!proposed) throw new Error("catalog_source_invalid_projection");

  const outcome = await writeStoredCatalog(proposed, previous?.etag ?? null);
  if (outcome === "written") {
    return { state: "available", products: proposed };
  }
  const winner = await readStoredCatalog();
  if (!winner) throw new Error("catalog_storage_conflict_without_snapshot");
  return { state: "available", products: productsFromStored(winner) };
}

/**
 * Public pages serve a durable site-owned copy immediately. If the last
 * successful sync is older than 15 minutes, refresh after the response.
 * A bad Admin response, network outage or partial catalog can never erase
 * a previously published page or truncate the 25 approved sitemap URLs.
 */
export async function getSiteCatalog(): Promise<CatalogRead> {
  let stored: StoredCatalog | null = null;
  try {
    stored = await readStoredCatalog();
    if (stored) {
      const products = productsFromStored(stored);
      const ageMs = Date.now() - Date.parse(stored.savedAt);
      const needsRefresh = !Number.isFinite(ageMs) || ageMs > REFRESH_INTERVAL_MS;
      if (needsRefresh && configuredSource()) {
        try {
          const versionToRefresh = stored;
          after(async () => {
            try { await refreshAndPersist(versionToRefresh); }
            catch (error) { warn("background_source_refresh_failed", error); }
          });
        } catch (error) {
          warn("background_refresh_schedule_unavailable", error);
        }
      }
      return { state: "available", products, degraded: needsRefresh };
    }
  } catch (error) {
    warn("durable_catalog_read_failed", error);
  }

  // Only the first successful request must build the durable catalog.
  // Never expose new product URLs before storage is confirmed.
  if (configuredSource()) {
    try {
      return await refreshAndPersist(stored);
    } catch (error) {
      warn("catalog_initial_sync_failed; serving editorial baseline", error);
    }
  }
  return publishedSnapshot(true);
}

/** Used by an authenticated refresh job; never callable from the browser. */
export async function syncSiteCatalog(): Promise<CatalogRead> {
  let previous: StoredCatalog | null = null;
  try { previous = await readStoredCatalog(); }
  catch (error) { warn("refresh_store_read_failed", error); throw error; }
  return refreshAndPersist(previous);
}
