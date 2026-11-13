import type { CatalogProduct } from "./catalog-contract";
import type { SourceItem } from "./catalog-source-contract";
import { suggestProductDisplayTitle } from "./editorial-titles";

/** Site-owned editorial seed: not a live Shopee status or data feed. */
export type SiteEditorialSeed = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  imageUrls: string[];
  variations: string[];
  material: string | null;
  dimensions: string | null;
  sourceSyncedAt: string;
};

type Options = { now: number; autoIndex: boolean };

/** These three already-published pages have unresolved review requirements. */
const blockedLegacySlugs = new Set([
  "kit-porta-figurinhas-3d",
  "dummy-13-boneco-articulado",
  "fita-cassete-retro",
]);

// A spelling heuristic is not a license check. Fail closed for obvious
// trademarks/characters, kits and source claims requiring human review.
const editorialRisk = /(?:\b(?:disney|pixar|marvel|avengers|dc comics|batman|superman|spider.?man|pokemon|pokémon|nintendo|mario|sonic|star wars|harry potter|stranger things|gta|minecraft|fortnite|roblox|lego|playstation|xbox|hello kitty|toy story|thor|hulk|deadpool|vingadores)\b|\b(?:licenciado|licenciada|oficial|réplica|replica|marca registrada)\b)/iu;
const genericItem = /\b(?:caix(?:a|inha)|estojo|porta|organizador|organizadora|suporte|placa|lumin[aá]ria|vaso|cachep[oô]|chaveiro|brinco|[ií]m[aã]|enfeite|decora(?:tivo|tiva|[çc][aã]o)|pinheiro|[aá]rvore|expositor|identificador|etiqueta|marcador)\b/iu;

function lastContentChange(item: SourceItem, fallback: string): string {
  const dates = [item.sourceUpdatedAt, item.product?.updatedAt, fallback]
    .filter((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)));
  return dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? fallback;
}

function sourceIsActive(item: SourceItem): boolean {
  return item.sourceStatus === "NORMAL"
    && (item.product === null
      || (item.product.active === true && item.product.status === "active"));
}

function currentStatus(item: SourceItem): CatalogProduct["sourceStatus"] {
  if (sourceIsActive(item)) return "NORMAL";
  if (item.sourceStatus === "SELLER_DELETE") return "SELLER_DELETE";
  if (item.sourceStatus === "BANNED") return "BANNED";
  // STALE, UNKNOWN and internally archived are not purchasable/indexable.
  return "UNLIST";
}

function verifiedDimensions(item: SourceItem): string | null {
  const measures = item.product?.dimensionsCm;
  if (!measures || measures.width === null || measures.height === null || measures.depth === null
    || !measures.width || !measures.height || !measures.depth) return null;
  const format = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return format(measures.width) + " × " + format(measures.height) + " × "
    + format(measures.depth) + " cm (L × A × P)";
}

function sourceSnippet(raw: string | null): string | null {
  if (!raw) return null;
  // Avoid bringing huge marketplace boilerplate, links or call-to-action spam
  // into site copy. The remaining claim still needs the automated quality gate.
  const paragraphs = raw.replace(/https?:\/\/\S+/giu, " ")
    .split(/\n+/u)
    .map((line) => line.replace(/[━•★✨✅✔️🔹🚀]+/gu, " ").replace(/\s+/gu, " ").trim())
    .filter((line) => line.length >= 55 && line.length < 900
      && !/^(?:compre|garantia|entrega|atenc[aã]o|envio|frete|descri[cç][aã]o|caracter[ií]sticas)\b/iu.test(line));
  const excerpt = paragraphs[0];
  if (!excerpt) return null;
  if (excerpt.length <= 245) return excerpt.replace(/[.!?]*$/u, ".");
  const cut = excerpt.slice(0, 245).lastIndexOf(" ");
  return excerpt.slice(0, Math.max(cut, 160)).replace(/[,:;\s]+$/u, "") + ".";
}

function siteIntroduction(name: string): string {
  if (/\b(?:caixa|caixinha|estojo|organizador|porta)\b/iu.test(name)) {
    return "Uma opção para reunir objetos e deixar o espaço mais organizado.";
  }
  if (/\b(?:placa|etiqueta|identificador)\b/iu.test(name)) {
    return "Uma peça para identificação ou decoração, conforme o modelo escolhido.";
  }
  if (/\b(?:vaso|cachep[oô]|enfeite|decorativ)\b/iu.test(name)) {
    return "Uma peça para compor ambientes e dar personalidade à decoração.";
  }
  if (/\b(?:suporte|expositor)\b/iu.test(name)) {
    return "Uma peça de apoio para uso ou exposição, conforme o formato do modelo.";
  }
  return "Conheça os detalhes desta peça do catálogo CMangini3D.";
}

function categoryFromName(name: string): string | null {
  if (/\b(?:natal|natalin|pinheiro|[aá]rvore de natal)\b/iu.test(name)) return "pecas-natalinas";
  if (/\b(?:vaso|cachep[oô])\b/iu.test(name)) return "vasos-decorativos";
  if (/\b(?:caixa|caixinha|estojo|organizador|porta)\b/iu.test(name)) return "caixas-e-porta-objetos";
  if (/\b(?:sensorial|fidget|articulado|girat[oó]ri)\b/iu.test(name)) return "pecas-sensoriais";
  if (/\b(?:chaveiro|placa|decorativ|enfeite|suporte)\b/iu.test(name)) return "pecas-decorativas-utilidades";
  return null;
}

function newSourceQuality(item: SourceItem, now: number): boolean {
  const name = item.sourceName?.trim();
  const description = item.sourceDescription?.trim();
  if (!sourceIsActive(item) || !name || name.length < 12 || name.length > 140
    || !description || description.length < 130
    || item.imageUrls.length < 2 || !sourceSnippet(description)
    || !genericItem.test(name) || /\bkit\b/iu.test(name)
    || editorialRisk.test(name + " " + description)) return false;
  if (!item.sourceSyncedAt) return false;
  const age = now - Date.parse(item.sourceSyncedAt);
  return Number.isFinite(age) && age >= -86_400_000 && age <= 14 * 86_400_000;
}

function newSiteProduct(item: SourceItem, options: Options): CatalogProduct | null {
  if (!newSourceQuality(item, options.now)) return null;
  const name = suggestProductDisplayTitle(item.sourceName as string);
  const snippet = sourceSnippet(item.sourceDescription);
  if (!snippet) return null;

  const dimensions = verifiedDimensions(item);
  const summary = name + ". Fotos e informações do produto no CMangini3D.";
  const intro = siteIntroduction(name);
  const details = dimensions ? "Medidas informadas: " + dimensions + ". " : "";
  const description = [
    name + ". " + intro,
    snippet,
    details + "Veja as fotografias e confirme as variações e a compatibilidade "
      + "com o uso pretendido antes de comprar pela Shopee.",
  ].join("\n\n");

  const seoDescription = (name + ". " + intro + " Conheça fotos, variações "
    + "e informações do modelo no CMangini3D.").slice(0, 165);

  return {
    // ID-based automatic permalink: a later rename cannot break indexing.
    slug: "produto-3d-" + item.itemId,
    name,
    summary,
    description,
    seoTitle: name,
    seoDescription,
    categorySlug: categoryFromName(name),
    shopeeUrl: item.shopeeUrl,
    imageUrls: item.imageUrls,
    material: null, // No verified material field exists in the Admin feed v1.
    dimensions,
    customizable: false, // Never infer that every product is customizable.
    variations: item.variations
      .filter((model) => model.sourceStatus === "MODEL_NORMAL" && model.sourceName)
      .map((model) => model.sourceName as string),
    sourceStatus: "NORMAL",
    sourceSyncedAt: item.sourceSyncedAt as string,
    contentUpdatedAt: lastContentChange(item, item.sourceSyncedAt as string),
    ...(options.autoIndex ? { autoIndexEligible: true } : {}),
  };
}

function knownSiteProduct(item: SourceItem, seed: SiteEditorialSeed): CatalogProduct {
  const status = currentStatus(item);
  const images = item.imageUrls.length > 0 ? item.imageUrls : seed.imageUrls;
  const variations = item.variations
    .filter((model) => model.sourceStatus === "MODEL_NORMAL" && model.sourceName)
    .map((model) => model.sourceName as string);
  return {
    slug: seed.slug,
    name: seed.name,
    summary: seed.summary,
    description: seed.description,
    seoTitle: seed.name,
    seoDescription: seed.summary,
    categorySlug: null,
    shopeeUrl: status === "NORMAL" ? item.shopeeUrl : null,
    imageUrls: images,
    material: seed.material,
    dimensions: verifiedDimensions(item) ?? seed.dimensions,
    customizable: false,
    variations,
    sourceStatus: status,
    sourceSyncedAt: item.sourceSyncedAt ?? seed.sourceSyncedAt,
    contentUpdatedAt: lastContentChange(item, seed.sourceSyncedAt),
  };
}

function missingSiteProduct(seed: SiteEditorialSeed): CatalogProduct {
  // A missing source is NOT proof of deletion. Keep the historic URL but do
  // not expose a possibly-invalid purchase link or index it.
  return {
    slug: seed.slug, name: seed.name, summary: seed.summary,
    description: seed.description, seoTitle: seed.name, seoDescription: seed.summary,
    categorySlug: null, shopeeUrl: null, imageUrls: seed.imageUrls,
    material: seed.material, dimensions: seed.dimensions, customizable: false,
    variations: seed.variations,
    sourceStatus: "UNLIST", sourceSyncedAt: seed.sourceSyncedAt,
    contentUpdatedAt: seed.sourceSyncedAt,
  };
}

/**
 * Reconcile source facts against the site's 28 human-curated pages.
 * New products get stable ID-only slugs and conditional site-generated copy.
 * No editorial writes or publication decisions happen in the Admin.
 */
export function buildSiteCatalog(
  source: readonly SourceItem[], seeds: readonly SiteEditorialSeed[], options: Options,
): CatalogProduct[] {
  const sourceById = new Map(source.map((item) => [item.itemId, item]));
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  if (sourceById.size !== source.length || seedById.size !== seeds.length) {
    throw new Error("catalog_duplicate_item_id");
  }

  // Do not mistake a scope/config issue for 28 source items being deleted.
  const matched = seeds.filter((seed) => sourceById.has(seed.id)).length;
  if (seeds.length > 0 && matched < Math.ceil(seeds.length / 2)) {
    throw new Error("catalog_source_scope_incomplete");
  }

  const known = seeds.map((seed) => {
    const item = sourceById.get(seed.id);
    return item ? knownSiteProduct(item, seed) : missingSiteProduct(seed);
  });

  const additions = source
    .filter((item) => !seedById.has(item.itemId))
    .map((item) => newSiteProduct(item, options))
    .filter((product): product is CatalogProduct => product !== null);

  // Legacy pending pages never gain index eligibility from automation.
  for (const product of known) {
    if (blockedLegacySlugs.has(product.slug)) product.autoIndexEligible = false;
  }
  return [...known, ...additions];
}
