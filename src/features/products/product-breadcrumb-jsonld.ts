import { SITE_URL } from "@/lib/site-seo";

/** Navegação estruturada sem inventar preço, estoque ou avaliações. */
export function productBreadcrumbJsonLd(product: { slug: string; name: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Produtos", item: `${SITE_URL}/produtos` },
      { "@type": "ListItem", position: 2, name: product.name, item: `${SITE_URL}/produtos/${product.slug}` },
    ],
  };
}
