export type StudioPrintStatus =
  | "produzido"
  | "conceito"
  | "produto"
  | "cliente";

export type StudioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type StudioPrintEntry = {
  slug: string;
  title: string;
  status: StudioPrintStatus;
  summary: string;
  images: StudioImage[];
  material?: string;
  dimensions?: string;
  canPublish: boolean;
  intellectualPropertyNote?: string;
};

export type StudioProduct = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  images: StudioImage[];
  materials: string[];
  dimensions?: string;
  options: string[];
  shopeeUrl?: string;
};

/**
 * Deliberately empty until real pieces are selected and publication permission is confirmed.
 * Do not add synthetic/example entries just to populate the interface.
 */
export const studioPrints: readonly StudioPrintEntry[] = [];

/**
 * Deliberately empty until a real product is approved for publication.
 * Price and stock are not stored here unless a reliable synchronization contract exists.
 */
export const studioProducts: readonly StudioProduct[] = [];

export function findStudioProduct(slug: string) {
  return studioProducts.find((product) => product.slug === slug);
}
