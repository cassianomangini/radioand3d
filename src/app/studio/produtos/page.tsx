import Image from "next/image";
import Link from "next/link";
import {
  MediaPlaceholder,
  PrimaryLink,
  StudioPageShell,
  StudioSection
} from "@/components/studio/studio-content";
import catalogStyles from "@/components/studio/studio-catalog.module.css";
import { studioProducts } from "@/features/studio/catalog";
import {
  absoluteSiteUrl,
  buildPublicMetadata
} from "@/lib/site-config";

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
    <StudioPageShell
      eyebrow="Produtos"
      title="Conheça a peça antes de comprar."
      lead="Fotos, medidas, variações e detalhes ficam organizados aqui. A Shopee entra somente no momento de finalizar a compra."
      pathname="/studio/produtos"
      breadcrumbLabel="Produtos"
    >
      <StudioSection title="Produtos do Estúdio">
        {studioProducts.length ? (
          <div className={catalogStyles.grid}>
            {studioProducts.map((product) => {
              const image = product.images[0];
              return (
                <Link
                  className={catalogStyles.item}
                  href={`/studio/produtos/${product.slug}`}
                  key={product.slug}
                >
                  {image ? (
                    <div className={catalogStyles.media}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(max-width: 1180px) 100vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className={catalogStyles.meta}>
                    <strong>{product.title}</strong>
                    <p>{product.summary}</p>
                  </div>
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
        <p>
          Cada produto abre uma página própria com galeria, medidas, ficha técnica e
          variações reais antes da saída para a Shopee.
        </p>
      </StudioSection>

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
    </StudioPageShell>
  );
}
