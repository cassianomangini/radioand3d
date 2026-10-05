import type { MetadataRoute } from "next";
import { absoluteSiteUrl, siteIndexable } from "@/lib/site-config";

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

  return publicRoutes.flatMap((pathname) => {
    const url = absoluteSiteUrl(pathname);
    return url ? [{ url }] : [];
  });
}
