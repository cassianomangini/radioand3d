import type { MetadataRoute } from "next";
import {
  hasSearchApprovedProducts,
  searchApprovedProducts,
} from "@/features/products/search-approval";
import { isIndexableDeployment, SITE_URL } from "@/lib/site-seo";
import { getSiteCatalog } from "@/server/products/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableDeployment()) return [];

  const publicPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/estudio` },
    { url: `${SITE_URL}/produtos` },
    { url: `${SITE_URL}/orcamentos` },
  ];

  // A exposicao de produtos ao Google depende de revisao editorial,
  // nao apenas da publicacao na Shopee.
  if (!hasSearchApprovedProducts()) return publicPages;

  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    // Melhor falhar temporariamente que anunciar a exclusao de todos os
    // produtos num sitemap 200 durante uma falha de infraestrutura.
    throw new Error("site_catalog_unavailable_for_sitemap");
  }

  return [
    ...publicPages,
    ...searchApprovedProducts(catalog.products).map((product) => ({
      url: `${SITE_URL}/produtos/${product.slug}`,
    })),
  ];
}
