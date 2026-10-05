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

export type StudioMaterialAvailability =
  | "disponivel"
  | "sob-consulta"
  | "indisponivel";

export type StudioMaterialColor = {
  id: string;
  name: string;
  finish: string;
  sample: StudioImage;
  availability: StudioMaterialAvailability;
  source: string;
  lastVerifiedAt: string;
};

export type StudioProductAvailability =
  | "disponivel"
  | "sob-consulta"
  | "indisponivel";

export type StudioProduct = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  images: StudioImage[];
  materials: string[];
  dimensions?: string;
  options: string[];
  availability: StudioProductAvailability;
  source: string;
  lastVerifiedAt: string;
  shopeeUrl?: string;
};

/**
 * Deliberately empty until real pieces are selected and publication permission is confirmed.
 * Do not add synthetic/example entries just to populate the interface.
 */
export const studioPrints: readonly StudioPrintEntry[] = [];

/**
 * Deliberately empty until real material/color samples are photographed and their
 * current availability has a known source. Do not populate this from generic swatches.
 */
export const studioMaterialColors: readonly StudioMaterialColor[] = [];

/**
 * Deliberately empty until a real product is approved for publication.
 * Price and stock are not stored here unless a reliable synchronization contract exists.
 */
export const studioProducts: readonly StudioProduct[] = [];

export function findStudioProduct(slug: string) {
  return studioProducts.find((product) => product.slug === slug);
}
