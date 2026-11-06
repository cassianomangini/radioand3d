import type { MetadataRoute } from "next";
import { visibleProducts } from "@/features/products/catalog-contract";
import { isIndexableDeployment, SITE_URL } from "@/lib/site-seo";
import { getSiteCatalog } from "@/server/products/catalog";

// O catálogo muda sem necessariamente haver novo deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableDeployment()) return [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/estudio`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/produtos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/orcamentos`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const catalog = await getSiteCatalog();
  if (catalog.state !== "available") return staticPages;

  return [
    ...staticPages,
    ...visibleProducts(catalog.products).map((product) => ({
      url: `${SITE_URL}/produtos/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
