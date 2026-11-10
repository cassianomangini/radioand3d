import type { CatalogProduct } from "@/features/products/catalog-contract";

export const productCategories = [
  { id: "pecas-natalinas", label: "Peças Natalinas", icon: "/images/categories/pecas-natalinas.png" },
  { id: "pecas-decorativas-utilidades", label: "Organização e Decoração", icon: "/images/categories/organizacao-decoracao.png" },
  { id: "pecas-sensoriais", label: "Peças Sensoriais", icon: "/images/categories/pecas-sensoriais.png" },
  { id: "caixas-e-porta-objetos", label: "Porta Objetos", icon: "/images/categories/porta-objetos.png" },
  { id: "vasos-decorativos", label: "Vasos Decorativos", icon: "/images/categories/vasos-decorativos.png" },
] as const;

export type ProductCategory = (typeof productCategories)[number]["id"];

const categoryIds = new Set<string>(productCategories.map((category) => category.id));

const knownProductCategories: Record<string, ProductCategory> = {
  "porta-figurinhas-3d": "caixas-e-porta-objetos",
  "caixa-organizadora-grande": "caixas-e-porta-objetos",
  "caixa-organizadora-dois-compartimentos": "caixas-e-porta-objetos",
  "caixa-organizadora-quadrada": "caixas-e-porta-objetos",
  "caixinha-organizadora-pequena": "caixas-e-porta-objetos",
  "estojo-duplo-compacto": "caixas-e-porta-objetos",
  "porta-controles-de-mesa": "caixas-e-porta-objetos",
  "porta-lapis-cachepo": "vasos-decorativos",
  "suporte-celular-articulado": "pecas-decorativas-utilidades",
  "chaveiro-mureta-santos": "pecas-decorativas-utilidades",
  "capa-botao-descarga": "pecas-decorativas-utilidades",
  "dinossauro-articulado-t-rex": "pecas-sensoriais",
  "dummy-13-boneco-articulado": "pecas-sensoriais",
  "fita-cassete-retro": "pecas-decorativas-utilidades",
  "imas-frases-veganas-2": "pecas-decorativas-utilidades",
  "imas-frases-veganas-4": "pecas-decorativas-utilidades",
  "bolinhas-basquete-sensoriais": "pecas-sensoriais",
  "kit-porta-curativos": "caixas-e-porta-objetos",
  "kit-porta-figurinhas-3d": "caixas-e-porta-objetos",
  "martelo-thor-rotativo": "pecas-sensoriais",
  "mini-arvore-pinheiro": "pecas-natalinas",
  "casinha-porta-iscas-formiga": "pecas-decorativas-utilidades",
  "nave-espacial-espiral": "pecas-sensoriais",
  "porta-controle-good-vibes": "caixas-e-porta-objetos",
  "porta-curativos-compacto": "caixas-e-porta-objetos",
  "porta-remedios-semanal": "caixas-e-porta-objetos",
  "trio-estrelas-decorativas": "pecas-natalinas",
  "kit-soldados-verdes-dedo-do-meio": "pecas-decorativas-utilidades",
};

export function getProductCategory(product: Pick<CatalogProduct, "slug" | "categorySlug">): ProductCategory | null {
  if (product.categorySlug && categoryIds.has(product.categorySlug)) {
    return product.categorySlug as ProductCategory;
  }
  return knownProductCategories[product.slug] ?? null;
}
