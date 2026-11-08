import type { Metadata } from "next";
import Link from "next/link";
import { visibleProducts } from "@/features/products/catalog-contract";
import { getSiteCatalog } from "@/server/products/catalog";
import { getProductCategory } from "./categories";
import { ProductCatalog } from "./product-catalog";
import styles from "./products.module.css";
import { getProductSubtitle } from "./subtitles";

const title = "Produtos Impressos em 3D | CMangini 3D";
const description = "Conheça caixas, organizadores, peças decorativas e outros produtos reais impressos em 3D pelo estúdio CMangini 3D, com compra pela Shopee.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/produtos" },
  openGraph: { title, description, url: "/produtos", type: "website" },
};

export default async function ProdutosPage() {
  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    // HTTP 5xx: nao apresentar erro temporario como pagina 200 indexavel.
    throw new Error("site_catalog_unavailable_for_listing");
  }
  const products = visibleProducts(catalog.products);
  const cards = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    subtitle: getProductSubtitle(product.slug),
    imageUrl: product.imageUrls[0],
    category: getProductCategory(product),
  }));

  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>Produtos</h1>
          <p>Conheça as peças do estúdio CMangini 3D.</p>
        </div>
      </header>

      <div className={styles.wrap}>
        {products.length > 0 ? (
          <section aria-labelledby="catalog-heading">
            <ProductCatalog products={cards} />
          </section>
        ) : (
          <section className={styles.empty} aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Catálogo em preparação</h2>
            <p>Estamos revisando os anúncios e as informações de cada peça antes de publicá-las.</p>
            <Link href="/estudio">Conheça o Estúdio <span aria-hidden="true">↗</span></Link>
          </section>
        )}
      </div>
    </div>
  );
}
