import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteCatalog } from "@/server/products/catalog";
import { isSearchApprovedProduct } from "@/features/products/search-approval";
import { isIndexableDeployment } from "@/lib/site-seo";
import { ProductGallery } from "../product-gallery";
import styles from "../products.module.css";
import { getProductSubtitle } from "../subtitles";
import { getProductDisplayTitle, getProductSeoTitle } from "@/features/products/editorial-titles";
import { getCatalogProductEditorial } from "@/features/products/catalog-product-editorial";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    throw new Error("site_catalog_unavailable_for_product_metadata");
  }
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) {
    return { title: "Produto indisponível | CMangini3D", robots: { index: false, follow: false } };
  }

  const metaDescription = getCatalogProductEditorial(product.slug)?.metaDescription ?? product.seoDescription;
  return {
    title: getProductSeoTitle(product),
    description: metaDescription,
    alternates: { canonical: `/produtos/${product.slug}` },
    robots: {
      index: isIndexableDeployment() && isSearchApprovedProduct(product),
      follow: isIndexableDeployment(),
    },
    openGraph: {
      title: getProductSeoTitle(product),
      description: metaDescription,
      url: `/produtos/${product.slug}`,
      type: "website",
      images: [{ url: product.imageUrls[0], alt: getProductDisplayTitle(product) }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    throw new Error("site_catalog_unavailable_for_product_detail");
  }
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product || product.sourceStatus === "SELLER_DELETE") notFound();
  const subtitle = getProductSubtitle(product.slug);
  const editorial = getCatalogProductEditorial(product.slug);

  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <p className={styles.bannerTitle}>Produtos</p>
          <p>Peças do estúdio CMangini3D.</p>
        </div>
      </header>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumbs} aria-label="Navegação estrutural">
          <Link href="/produtos">Produtos</Link><span aria-hidden="true">/</span><span aria-current="page">{getProductDisplayTitle(product)}</span>
        </nav>
        <article className={styles.detail}>
          <ProductGallery key={product.slug} name={getProductDisplayTitle(product)} images={product.imageUrls} />
          <div className={styles.detailCopy}>
            <h1>{getProductDisplayTitle(product)}</h1>
            {editorial && <p className={styles.detailLead}>{editorial.lead}</p>}
            {editorial && (
              <dl className={styles.editorialFacts}>
                {editorial.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {subtitle && <p className={styles.detailSubtitle}>{subtitle}</p>}
            {!editorial && (product.material || product.dimensions) && (
              <section className={styles.specs} aria-labelledby="specs-heading">
                <h2 id="specs-heading">Detalhes</h2>
                <table>
                  <tbody>
                    {product.material && <tr><th scope="row">Material</th><td>{product.material}</td></tr>}
                    {product.dimensions && <tr><th scope="row">Dimensões</th><td>{product.dimensions}</td></tr>}
                    {product.slug === "porta-figurinhas-3d" && <tr><th scope="row">Capacidade</th><td>+100 figurinhas</td></tr>}
                  </tbody>
                </table>
              </section>
            )}
            {product.sourceStatus === "NORMAL" && product.shopeeUrl ? (
              <a className={styles.primaryAction} href={product.shopeeUrl} target="_blank" rel="noopener noreferrer">
                Comprar na Shopee <span aria-hidden="true">↗</span>
              </a>
            ) : <p className={styles.notice}>Este anúncio não está disponível para compra no momento.</p>}
            <Link className={styles.secondaryAction} href={`/orcamentos?produto=${encodeURIComponent(product.slug)}`}>
              Gerar orçamento <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <section className={styles.description} aria-labelledby="description-heading">
            <h2 id="description-heading">Sobre a peça</h2>
            {editorial ? (
              <>
                <p>{editorial.body}</p>
                <p className={styles.editorialNote}>{editorial.note}</p>
              </>
            ) : product.description.split(/\n\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
          <div className={styles.descriptionActions}>
            <Link className={styles.secondaryAction} href={`/orcamentos?produto=${encodeURIComponent(product.slug)}`}>
              Gerar orçamento <span aria-hidden="true">↗</span>
            </Link>
            {product.sourceStatus === "NORMAL" && product.shopeeUrl && (
              <a className={styles.primaryAction} href={product.shopeeUrl} target="_blank" rel="noopener noreferrer">
                Comprar na Shopee <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
