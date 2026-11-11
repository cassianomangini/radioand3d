import type { CatalogProduct } from "./catalog-contract";

// Aprovacao editorial separada do status da Shopee. Uma listagem NORMAL nao
// e automaticamente uma pagina pronta para indexacao.
// Expansao 11/11/2026: slugs explicitamente revisados e NORMAL na Shopee live.
// Somente o status NORMAL + whitelist libera indexacao; novos itens nao sao
// aprovados automaticamente. Ver docs/SEO_EXPANSAO_CATALOGO_2026-11-11.md.
// Atenção: fallback de catalogo em Vercel e snapshot; mudancas de status
// na Shopee exigem revalidacao/sincronizacao para refletir no site.
const approvedSlugs = new Set<string>([
  "caixa-organizadora-dois-compartimentos",
  "porta-curativos-compacto",
  "porta-controles-de-mesa",
  "casinha-porta-iscas-formiga",
  "caixa-organizadora-grande",
  "porta-figurinhas-3d",
  "caixa-organizadora-quadrada",
  "caixinha-organizadora-pequena",
  "estojo-duplo-compacto",
  "porta-lapis-cachepo",
  "suporte-celular-articulado",
  "chaveiro-mureta-santos",
  "capa-botao-descarga",
  "dinossauro-articulado-t-rex",
  "imas-frases-veganas-2",
  "imas-frases-veganas-4",
  "bolinhas-basquete-sensoriais",
  "kit-porta-curativos",
  "mini-arvore-pinheiro",
  "nave-espacial-espiral",
  "porta-controle-good-vibes",
  "porta-remedios-semanal",
  "trio-estrelas-decorativas",
  "martelo-thor-rotativo",
  "kit-soldados-verdes-dedo-do-meio",
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
