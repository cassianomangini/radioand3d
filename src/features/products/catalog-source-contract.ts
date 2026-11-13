/**
 * The Admin exports operational facts only. This parser is the untrusted
 * machine-to-machine boundary; publication and SEO are owned by this site.
 */
export const CATALOG_SHOP_ID = 1433140862;
export const CATALOG_SOURCE_PAGE_SIZE = 50;
export const CATALOG_SOURCE_MAX_PAGES = 30;

export type SourceProduct = {
  id: number;
  sourceName: string;
  sourceDescription: string | null;
  active: boolean;
  status: string;
  dimensionsCm: { width: number | null; height: number | null; depth: number | null };
  estimatedWeightG: number | null;
  updatedAt: string | null;
};

export type SourceItem = {
  itemId: number;
  shopId: number;
  sourceName: string | null;
  sourceDescription: string | null;
  sourceStatus: string;
  sourceSku: string | null;
  sourceCategoryId: number | null;
  sourceSyncedAt: string | null;
  sourceUpdatedAt: string | null;
  shopeeUrl: string | null;
  imageUrls: string[];
  product: SourceProduct | null;
  variations: { modelId: number; sourceName: string | null; sourceStatus: string }[];
};

export type SourcePage = {
  items: SourceItem[];
  hasMore: boolean;
  nextCursor: number | null;
};

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function optionalText(value: unknown, limit = 8000): value is string | null {
  return value === null || (typeof value === "string" && value.length <= limit);
}

function date(value: unknown): value is string | null {
  return value === null || (typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T/.test(value)
    && Number.isFinite(Date.parse(value)));
}

function optionalMeasure(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0);
}

function shopeeImage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "cf.shopee.com.br"
      && url.pathname.startsWith("/file/") && !url.username && !url.password
      && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function shopeeLink(value: unknown, shopId: number, itemId: number): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && ["shopee.com.br", "www.shopee.com.br"].includes(url.hostname)
      && url.pathname === "/product/" + shopId + "/" + itemId
      && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function parseProduct(value: unknown): SourceProduct | null | undefined {
  if (value === null) return null;
  if (!object(value) || !positiveId(value.id) || !optionalText(value.sourceDescription)
    || typeof value.sourceName !== "string" || !value.sourceName.trim()
    || value.sourceName.length > 250 || typeof value.active !== "boolean"
    || !["active", "archived", "draft"].includes(String(value.status))
    || !object(value.dimensionsCm)
    || !optionalMeasure(value.dimensionsCm.width)
    || !optionalMeasure(value.dimensionsCm.height)
    || !optionalMeasure(value.dimensionsCm.depth)
    || !optionalMeasure(value.estimatedWeightG) || !date(value.updatedAt)) return undefined;
  return {
    id: value.id, sourceName: value.sourceName, sourceDescription: value.sourceDescription,
    active: value.active, status: String(value.status),
    dimensionsCm: {
      width: value.dimensionsCm.width, height: value.dimensionsCm.height,
      depth: value.dimensionsCm.depth,
    },
    estimatedWeightG: value.estimatedWeightG, updatedAt: value.updatedAt,
  } as SourceProduct;
}

function parseItem(value: unknown, expectedShopId: number): SourceItem | null {
  if (!object(value) || !positiveId(value.itemId) || value.shopId !== expectedShopId
    || !optionalText(value.sourceName, 250) || !optionalText(value.sourceDescription)
    || typeof value.sourceStatus !== "string"
    || !/^[A-Z0-9_]{1,32}$/.test(value.sourceStatus)
    || !optionalText(value.sourceSku, 120)
    || (value.sourceCategoryId !== null && !positiveId(value.sourceCategoryId))
    || !date(value.sourceSyncedAt) || !date(value.sourceUpdatedAt)
    || !Array.isArray(value.imageUrls) || value.imageUrls.length > 9
    || !value.imageUrls.every(shopeeImage)
    || !Array.isArray(value.variations) || value.variations.length > 200) return null;

  const shopeeUrl = value.shopeeUrl;
  if (value.sourceStatus === "NORMAL"
    ? !shopeeLink(shopeeUrl, expectedShopId, value.itemId)
    : shopeeUrl !== null) return null;

  const product = parseProduct(value.product);
  if (product === undefined) return null;

  const variations: SourceItem["variations"] = [];
  const seen = new Set<number>();
  for (const candidate of value.variations) {
    if (!object(candidate) || !positiveId(candidate.modelId)
      || !optionalText(candidate.sourceName, 250)
      || typeof candidate.sourceStatus !== "string"
      || !/^[A-Z0-9_]{1,32}$/.test(candidate.sourceStatus)
      || seen.has(candidate.modelId)) return null;
    seen.add(candidate.modelId);
    variations.push({
      modelId: candidate.modelId,
      sourceName: candidate.sourceName,
      sourceStatus: candidate.sourceStatus,
    });
  }

  return {
    itemId: value.itemId, shopId: expectedShopId,
    sourceName: value.sourceName, sourceDescription: value.sourceDescription,
    sourceStatus: value.sourceStatus, sourceSku: value.sourceSku,
    sourceCategoryId: value.sourceCategoryId,
    sourceSyncedAt: value.sourceSyncedAt, sourceUpdatedAt: value.sourceUpdatedAt,
    shopeeUrl: value.shopeeUrl, imageUrls: value.imageUrls,
    product, variations,
  } as SourceItem;
}

/** Fail the entire page rather than silently drop a row and deindex its URL. */
export function parseCatalogSourcePage(
  value: unknown, after = 0, expectedShopId = CATALOG_SHOP_ID,
): SourcePage | null {
  if (!object(value) || value.version !== 1
    || !Array.isArray(value.items) || value.items.length > CATALOG_SOURCE_PAGE_SIZE
    || typeof value.hasMore !== "boolean") return null;

  const items: SourceItem[] = [];
  let previous = after;
  for (const item of value.items) {
    const parsed = parseItem(item, expectedShopId);
    if (!parsed || parsed.itemId <= previous) return null;
    previous = parsed.itemId;
    items.push(parsed);
  }

  if (value.hasMore) {
    if (items.length !== CATALOG_SOURCE_PAGE_SIZE || value.nextCursor !== previous) return null;
  } else if (value.nextCursor !== null) return null;

  return { items, nextCursor: value.hasMore ? previous : null, hasMore: value.hasMore };
}
