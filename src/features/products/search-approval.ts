import type { CatalogProduct } from "./catalog-contract";

// Editorial publicacao continua pertencendo exclusivamente ao CMangini3D.
// Os 25 slugs revisados permanecem aprovados. Novas paginas geradas pelo site
// podem ser indexadas somente com gate de qualidade e flag de rollout explicita.
// Status NORMAL da Shopee sozinho nunca e autorizacao de indexacao.
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

type Candidate = Pick<CatalogProduct, "slug" | "sourceStatus"> &
  Partial<Pick<CatalogProduct, "autoIndexEligible">>;

export function isSearchApprovedProduct(product: Candidate): boolean {
  if (product.sourceStatus !== "NORMAL") return false;
  if (approvedSlugs.has(product.slug)) return true;
  return product.autoIndexEligible === true
    && /^produto-3d-[1-9]\d*$/.test(product.slug);
}

export function searchApprovedProducts<T extends Candidate>(products: readonly T[]): T[] {
  return products.filter(isSearchApprovedProduct);
}

export function hasSearchApprovedProducts(): boolean {
  return approvedSlugs.size > 0;
}
