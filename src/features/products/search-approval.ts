import type { CatalogProduct } from "./catalog-contract";

// Aprovacao editorial separada do status da Shopee. Uma listagem NORMAL nao
// e automaticamente uma pagina pronta para indexacao.
// Adicionar slugs somente apos revisar fotos, conteudo proprio, atributos e links.
const approvedSlugs = new Set<string>([
  // Piloto editorial pendente de revisao.
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
