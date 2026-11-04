import type { Metadata } from "next";
import Link from "next/link";
import { visibleProducts } from "@/features/products/catalog-contract";
import { getSiteCatalog } from "@/server/products/catalog";
import styles from "./products.module.css";

export const metadata: Metadata = {
  title: "Produtos — CM 3D & Rádio",
  description: "Peças impressas em 3D do estúdio CM 3D.",
};

export default async function ProdutosPage() {
  const catalog = await getSiteCatalog();
  const products = visibleProducts(catalog.products);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CM 3D · Estúdio</p>
          <h1>Peças feitas para ficar.</h1>
          <p>Conheça os produtos do estúdio. Cada peça publicada aqui tem um anúncio próprio na Shopee.</p>
        </header>

        {products.length > 0 ? (
          <section aria-labelledby="catalog-heading" className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2 id="catalog-heading">Produtos</h2>
              <span>{products.length} {products.length === 1 ? "peça" : "peças"}</span>
            </div>
            <div className={styles.grid}>
              {products.map((product) => (
                <Link className={styles.card} href={`/produtos/${product.slug}`} key={product.slug}>
                  <span className={styles.cardImage}>
                    {/* Imagem comercial remota; a fonte já foi validada no contrato. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrls[0]} alt={product.name} width="600" height="750" loading="lazy" />
                  </span>
                  <span className={styles.cardBody}>
                    <strong>{product.name}</strong>
                    <span>{product.summary}</span>
                    <span className={styles.cardAction}>Ver detalhes <span aria-hidden="true">↗</span></span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.empty} aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Catálogo em preparação</h2>
            <p>{catalog.state === "unavailable"
              ? "Os produtos estão temporariamente indisponíveis aqui."
              : "Estamos revisando os anúncios e as informações de cada peça antes de publicá-las."}</p>
            <Link href="/estudio">Conheça o Estúdio <span aria-hidden="true">↗</span></Link>
          </section>
        )}
      </div>
    </div>
  );
}
