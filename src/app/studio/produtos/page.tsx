import Image from "next/image";
import Link from "next/link";
import {
  MediaPlaceholder,
  PrimaryLink,
  StudioBreadcrumbs,
  StudioSection
} from "@/components/studio/studio-content";
import { studioProducts } from "@/features/studio/catalog";
import {
  absoluteSiteUrl,
  buildPublicMetadata
} from "@/lib/site-config";
import styles from "./products-page.module.css";

export const metadata = buildPublicMetadata({
  title: "Produtos do Estúdio | CM 3D & Radio",
  description:
    "Produtos impressos em 3D apresentados com fotos, medidas, materiais e variações antes da compra na Shopee.",
  pathname: "/studio/produtos"
});

export default function StudioProductsPage() {
  const itemList = studioProducts.flatMap((product, index) => {
    const url = absoluteSiteUrl(`/studio/produtos/${product.slug}`);
    return url
      ? [{
          "@type": "ListItem",
          position: index + 1,
          name: product.title,
          url
        }]
      : [];
  });

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <StudioBreadcrumbs currentLabel="Produtos" pathname="/studio/produtos" />
        <h1 className={styles.title}>Produtos do <span>Estúdio</span></h1>
      </header>

      <section aria-label="Produtos do Estúdio">
        {studioProducts.length ? (
          <div className={styles.grid}>
            {studioProducts.map((product) => {
              const image = product.images[0];
              return (
                <Link
                  className={styles.card}
                  href={`/studio/produtos/${product.slug}`}
                  key={product.slug}
                >
                  {image ? (
                    <div className={styles.media}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <strong className={styles.cardTitle}>{product.title}</strong>
                  <p className={styles.cardSummary}>{product.summary}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <MediaPlaceholder
            kind="user-photo"
            note="Fotografia real do primeiro produto publicado no site. Não criaremos cards vazios para simular variedade."
          />
        )}
        <p className={styles.catalogNote}>
          Cada produto abre uma página própria com galeria, medidas, ficha técnica e
          variações reais antes da saída para a Shopee.
        </p>
      </section>

      <div className={styles.details}>
        <StudioSection
          eyebrow="Compra externa"
          title="Preço e disponibilidade são confirmados na Shopee"
        >
          <p>
            O site não replica preço ou estoque sem sincronização confiável. A página
            própria explica a peça e mantém um único CTA comercial: “Comprar na Shopee”.
          </p>
        </StudioSection>

        <StudioSection title="Precisa de outra medida ou de algo personalizado?">
          <p>
            Produto pronto e projeto sob medida são jornadas diferentes. Uma necessidade
            específica segue pelo orçamento, sem obrigar a pessoa a procurar outro canal.
          </p>
          <PrimaryLink href="/studio/orcamento">Pedir algo personalizado</PrimaryLink>
        </StudioSection>
      </div>

      {itemList.length === studioProducts.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: itemList
            })
          }}
        />
      ) : null}
    </article>
  );
}
