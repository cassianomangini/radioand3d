import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteCatalog } from "@/server/products/catalog";
import { isSearchApprovedProduct } from "@/features/products/search-approval";
import { isIndexableDeployment } from "@/lib/site-seo";
import { ProductGallery } from "../product-gallery";
import styles from "../products.module.css";
import { getProductSubtitle } from "../subtitles";

type Props = { params: Promise<{ slug: string }> };

const breadcrumbNames: Record<string, string> = {
  "porta-figurinhas-3d": "Porta Figurinhas 3D com Tampa",
  "caixa-organizadora-grande": "Caixa Organizadora Grande",
  "caixa-organizadora-dois-compartimentos": "Caixa com 2 Compartimentos",
  "caixa-organizadora-quadrada": "Caixa Organizadora Quadrada",
  "caixinha-organizadora-pequena": "Caixinha Organizadora Pequena",
  "estojo-duplo-compacto": "Estojo Duplo Compacto",
  "porta-controles-de-mesa": "Porta Controles de Mesa",
  "porta-lapis-cachepo": "Porta Lápis / Cachepô",
  "suporte-celular-articulado": "Suporte Celular Articulado",
  "chaveiro-mureta-santos": "Chaveiro Mureta de Santos",
  "capa-botao-descarga": "Capa para Botão de Descarga",
  "dinossauro-articulado-t-rex": "Dinossauro Articulado T-Rex",
  "dummy-13-boneco-articulado": "Dummy 13 Articulado",
  "fita-cassete-retro": "Fita Cassete Retrô",
  "imas-frases-veganas-2": "Kit 2 Ímãs Frases Veganas",
  "imas-frases-veganas-4": "Kit 4 Ímãs Frases Veganas",
  "bolinhas-basquete-sensoriais": "Bolinhas de Basquete Texturizadas",
  "kit-porta-curativos": "Kit Porta Curativos",
  "kit-porta-figurinhas-3d": "Kit Porta Figurinhas 3D",
  "martelo-thor-rotativo": "Martelo de Brinquedo Thor",
  "mini-arvore-pinheiro": "Mini Árvore Decorativa",
  "casinha-porta-iscas-formiga": "Casinha Porta Iscas de Formiga",
  "nave-espacial-espiral": "Nave Espacial de Encaixe",
  "porta-controle-good-vibes": "Porta Controle Good Vibes",
  "porta-curativos-compacto": "Porta Curativos Compacto",
  "porta-remedios-semanal": "Porta Remédios Semanal",
  "trio-estrelas-decorativas": "Trio de Estrelas Decorativas",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  if (catalog.state === "unavailable") {
    throw new Error("site_catalog_unavailable_for_product_metadata");
  }
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) {
    return { title: "Produto indisponível | CMangini 3D", robots: { index: false, follow: false } };
  }

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: `/produtos/${product.slug}` },
    robots: {
      index: isIndexableDeployment() && isSearchApprovedProduct(product),
      follow: isIndexableDeployment(),
    },
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      url: `/produtos/${product.slug}`,
      type: "website",
      images: [{ url: product.imageUrls[0], alt: product.name }],
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

  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <p className={styles.bannerTitle}>Produtos</p>
          <p>Peças do estúdio CMangini 3D.</p>
        </div>
      </header>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumbs} aria-label="Navegação estrutural">
          <Link href="/produtos">Produtos</Link><span aria-hidden="true">/</span><span aria-current="page">{breadcrumbNames[product.slug] ?? product.name}</span>
        </nav>
        <article className={styles.detail}>
          <ProductGallery key={product.slug} name={product.name} images={product.imageUrls} />
          <div className={styles.detailCopy}>
            <h1>{product.name}</h1>
            {subtitle && <p className={styles.detailSubtitle}>{subtitle}</p>}
            {(product.material || product.dimensions) && (
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
            {product.description.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
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
