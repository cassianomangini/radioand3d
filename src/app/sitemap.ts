import type { MetadataRoute } from "next";
import { absoluteSiteUrl, siteIndexable } from "@/lib/site-config";
import { studioProducts } from "@/features/studio/catalog";

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

  const routes = [
    ...publicRoutes,
    ...studioProducts.map((product) => `/studio/produtos/${product.slug}`)
  ];

  return routes.flatMap((pathname) => {
    const url = absoluteSiteUrl(pathname);
    return url ? [{ url }] : [];
  });
}
