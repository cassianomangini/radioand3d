import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteCatalog } from "@/server/products/catalog";
import { ProductGallery } from "../product-gallery";
import styles from "../products.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) return { title: "Produto — CM 3D & Rádio", robots: { index: false } };
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    robots: { index: false, follow: false },
    openGraph: { title: product.seoTitle, description: product.seoDescription, images: [product.imageUrls[0]] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    return <div className={styles.page}><header className={styles.banner}><div className={styles.bannerContent}>
      <p className={styles.bannerTitle}>Produtos</p>
      <p>Peças do Estúdio CM 3D.</p>
    </div></header><div className={styles.wrap}><div className={styles.empty}>
      <h1>Produto temporariamente indisponível</h1>
      <p>Não conseguimos carregar os detalhes agora.</p>
      <Link href="/produtos">Voltar aos produtos</Link>
    </div></div></div>;
  }
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product || product.sourceStatus === "SELLER_DELETE") notFound();

  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <p className={styles.bannerTitle}>Produtos</p>
          <p>Peças do Estúdio CM 3D.</p>
        </div>
      </header>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumbs} aria-label="Navegação estrutural">
          <Link href="/produtos">Produtos</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span>
        </nav>
        <article className={styles.detail}>
          <ProductGallery key={product.slug} name={product.name} images={product.imageUrls} />
          <div className={styles.detailCopy}>
            <h1>{product.name}</h1>
            <p className={styles.summary}>{product.summary}</p>
            {product.sourceStatus === "NORMAL" && product.shopeeUrl ? (
              <a className={styles.primaryAction} href={product.shopeeUrl} target="_blank" rel="noopener noreferrer">
                Comprar na Shopee <span aria-hidden="true">↗</span>
              </a>
            ) : <p className={styles.notice}>Este anúncio não está disponível para compra no momento.</p>}
            {product.customizable && <Link className={styles.secondaryAction} href={`/orcamentos?produto=${encodeURIComponent(product.slug)}`}>
              Solicitar orçamento <span aria-hidden="true">↗</span>
            </Link>}
            <section className={styles.description} aria-labelledby="description-heading">
              <h2 id="description-heading">Sobre a peça</h2>
              {product.description.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
            {(product.material || product.dimensions || product.variations.length > 0) && (
              <section className={styles.specs} aria-labelledby="specs-heading">
                <h2 id="specs-heading">Detalhes</h2>
                <dl>
                  {product.material && <><dt>Material</dt><dd>{product.material}</dd></>}
                  {product.dimensions && <><dt>Dimensões</dt><dd>{product.dimensions}</dd></>}
                  {product.variations.length > 0 && <><dt>Variações</dt><dd>{product.variations.join(", ")}</dd></>}
                </dl>
              </section>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
