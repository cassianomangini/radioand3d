import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PrimaryLink,
  StudioPageShell,
  StudioSection,
  TextList
} from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";
import { findStudioProduct, studioProducts } from "@/features/studio/catalog";
import styles from "./product-page.module.css";

export function generateStaticParams() {
  return studioProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findStudioProduct(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | CM 3D & Radio",
      robots: { index: false, follow: false }
    };
  }

  return buildPublicMetadata({
    title: `${product.title} | Produtos do Estúdio | CM 3D & Radio`,
    description: product.summary,
    pathname: `/studio/produtos/${product.slug}`
  });
}

export default async function StudioProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findStudioProduct(slug);
  if (!product) notFound();

  return (
    <StudioPageShell
      eyebrow="Produto"
      title={product.title}
      lead={product.summary}
      pathname={`/studio/produtos/${product.slug}`}
      breadcrumbLabel={product.title}
    >
      <StudioSection title="Fotos do produto">
        <div className={styles.gallery}>
          {product.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 1180px) 100vw, 50vw"
            />
          ))}
        </div>
      </StudioSection>

      <StudioSection title="O que você precisa saber">
        <p>{product.description}</p>
        {product.dimensions ? <p><strong>Medidas:</strong> {product.dimensions}</p> : null}
        {product.materials.length ? (
          <TextList>
            {product.materials.map((material) => <li key={material}>{material}</li>)}
          </TextList>
        ) : null}
        {product.options.length ? (
          <TextList>
            {product.options.map((option) => <li key={option}>{option}</li>)}
          </TextList>
        ) : null}
      </StudioSection>

      <StudioSection eyebrow="Compra" title="Finalização na Shopee">
        {product.shopeeUrl ? (
          <PrimaryLink href={product.shopeeUrl}>Ver preço e disponibilidade na Shopee</PrimaryLink>
        ) : (
          <p>Este produto ainda não tem checkout externo publicado.</p>
        )}
      </StudioSection>

      <StudioSection title="Precisa de outra medida?">
        <PrimaryLink href={`/studio/orcamento?origem=produto&referencia=${encodeURIComponent(product.slug)}`}>
          Pedir algo personalizado
        </PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
