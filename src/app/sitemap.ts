import type { MetadataRoute } from "next";
import { absoluteSiteUrl, siteIndexable } from "@/lib/site-config";
import { studioProducts } from "@/features/studio/catalog";
import { publishedRadioPublications } from "@/features/radio/publications";

const publicRoutes = [
  "/",
  "/studio",
  "/studio/impressoes",
  "/studio/impressao-3d-sob-demanda",
  "/studio/placas-personalizadas",
  "/studio/caixas-personalizadas",
  "/studio/orcamento",
  "/studio/produtos"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteIndexable) return [];

  const publicEntries = publicRoutes.flatMap((pathname) => {
    const url = absoluteSiteUrl(pathname);
    return url ? [{ url }] : [];
  });

  const productEntries = studioProducts.flatMap((product) => {
    const url = absoluteSiteUrl(`/studio/produtos/${product.slug}`);
    return url
      ? [{
          url,
          lastModified: product.lastVerifiedAt
        }]
      : [];
  });

  const musicEntries = publishedRadioPublications.flatMap((publication) => {
    const url = absoluteSiteUrl(`/musica/${publication.slug}`);
    return url ? [{ url }] : [];
  });

  return [...publicEntries, ...productEntries, ...musicEntries];
}
