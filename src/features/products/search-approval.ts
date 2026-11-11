import type { CatalogProduct } from "./catalog-contract";

// Aprovacao editorial separada do status da Shopee. Uma listagem NORMAL nao
// e automaticamente uma pagina pronta para indexacao.
// Piloto 11/11/2026: 5 anuncios NORMAL e vinculados (leitura Shopee live),
// conteudo editorial por produto e fotos do respectivo anuncio no catalogo.
// Evidencias e verificacoes pendentes: docs/SEO_PILOTO_SHOPEE_2026-11-11.md.
const approvedSlugs = new Set<string>([
  "caixa-organizadora-dois-compartimentos",
  "porta-curativos-compacto",
  "porta-controles-de-mesa",
  "casinha-porta-iscas-formiga",
  "caixa-organizadora-grande",
]);

export function isSearchApprovedProduct(
  product: Pick<CatalogProduct, "slug" | "sourceStatus">,
): boolean {
  return product.sourceStatus === "NORMAL" && approvedSlugs.has(product.slug);
}

export function searchApprovedProducts<T extends Pick<CatalogProduct, "slug" | "sourceStatus">>(
  products: readonly T[],
): T[] {
  return products.filter(isSearchApprovedProduct);
}

export function hasSearchApprovedProducts(): boolean {
  return approvedSlugs.size > 0;
}
