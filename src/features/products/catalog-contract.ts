export type CatalogProduct = {
  slug: string;
  /** Site-derived eligibility only; never a field from the Admin feed. */
  autoIndexEligible?: boolean;
  name: string;
  summary: string;
  description: string;
  categorySlug: string | null;
  seoTitle: string;
  seoDescription: string;
  shopeeUrl: string | null;
  imageUrls: string[];
  material: string | null;
  dimensions: string | null;
  customizable: boolean;
  variations: string[];
  sourceStatus: "NORMAL" | "UNLIST" | "BANNED" | "SELLER_DELETE";
  sourceSyncedAt: string;
  contentUpdatedAt: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalText(value: unknown): value is string | null {
  return value === null || nonempty(value);
}

function shopeeImage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "cf.shopee.com.br"
      && url.pathname.startsWith("/file/")
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

function shopeeListing(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && ["shopee.com.br", "www.shopee.com.br"].includes(url.hostname)
      && !url.username && !url.password
      && (/\/product\/\d+\/\d+\/?$/.test(url.pathname) || /-i\.\d+\.\d+\/?$/.test(url.pathname));
  } catch {
    return false;
  }
}

function isoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseProduct(value: unknown): CatalogProduct | null {
  if (!record(value)) return null;
  const {
    slug, name, summary, description, categorySlug, seoTitle, seoDescription, autoIndexEligible,
    shopeeUrl, imageUrls, material, dimensions, customizable, variations,
    sourceStatus, sourceSyncedAt, contentUpdatedAt,
  } = value;
  if (typeof slug !== "string" || !slugPattern.test(slug)
    || !nonempty(name) || !nonempty(summary) || !nonempty(description)
    || !nonempty(seoTitle) || !nonempty(seoDescription)
    || (autoIndexEligible !== undefined && typeof autoIndexEligible !== "boolean")
    || (categorySlug !== null && (typeof categorySlug !== "string" || !slugPattern.test(categorySlug)))
    || !optionalText(material) || !optionalText(dimensions)
    || typeof customizable !== "boolean"
    || !Array.isArray(imageUrls) || imageUrls.length === 0 || !imageUrls.every(shopeeImage)
    || !Array.isArray(variations) || !variations.every(nonempty)
    || !isoDate(sourceSyncedAt) || !isoDate(contentUpdatedAt)) return null;

  if (sourceStatus !== "NORMAL" && sourceStatus !== "UNLIST"
    && sourceStatus !== "BANNED" && sourceStatus !== "SELLER_DELETE") return null;
  if (sourceStatus === "NORMAL" ? !shopeeListing(shopeeUrl) : shopeeUrl !== null) return null;

  return {
    slug, name, summary, description, categorySlug, seoTitle, seoDescription,
    ...(autoIndexEligible === true ? { autoIndexEligible: true } : {}),
    shopeeUrl: shopeeUrl as string | null, imageUrls, material, dimensions, customizable, variations,
    sourceStatus, sourceSyncedAt, contentUpdatedAt,
  };
}

export function parseCatalogResponse(value: unknown): CatalogProduct[] | null {
  if (!record(value) || !Array.isArray(value.products) || value.products.length > 1500) return null;
  const products = value.products.map(parseProduct);
  if (products.some((product) => product === null)) return null;
  const valid = products as CatalogProduct[];
  if (new Set(valid.map((product) => product.slug)).size !== valid.length) return null;
  return valid;
}

export function visibleProducts(products: readonly CatalogProduct[]): CatalogProduct[] {
  return products.filter((product) => product.sourceStatus === "NORMAL");
}
