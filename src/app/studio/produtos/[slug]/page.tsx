import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PrimaryLink,
  StudioBreadcrumbs
} from "@/components/studio/studio-content";
import { ProductDetail } from "@/components/studio/product-detail";
import {
  findStudioProduct,
  studioProducts,
  type StudioMeasurementSet
} from "@/features/studio/catalog";
import {
  absoluteSiteUrl,
  buildPublicMetadata
} from "@/lib/site-config";
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

  const image = product.images[0];

  return buildPublicMetadata({
    title: `${product.title} | Produtos do Estúdio | CM 3D & Radio`,
    description: product.summary,
    pathname: `/studio/produtos/${product.slug}`,
    image: image
      ? {
          url: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height
        }
      : undefined
  });
}

function MeasurementDiagram({ measurement }: { measurement: StudioMeasurementSet }) {
  const [primary, secondary, tertiary] = measurement.values;

  return (
    <figure className={styles.measurement}>
      <div className={styles.measurementDrawing}>
        <svg
          viewBox="0 0 440 230"
          role="img"
          aria-label={`Diagrama de referência: ${measurement.label}`}
        >
          <rect x="105" y="48" width="220" height="112" rx="8" />
          <path d="M105 48 145 28h220l-40 20" />
          <path d="M325 48 365 28v112l-40 20" />

          <line x1="105" y1="190" x2="325" y2="190" />
          <path d="m105 190 12-6v12Z" />
          <path d="m325 190-12-6v12Z" />
          <text x="215" y="216" textAnchor="middle">
            {primary?.value ?? "—"}
          </text>

          <line x1="72" y1="48" x2="72" y2="160" />
          <path d="m72 48-6 12h12Z" />
          <path d="m72 160-6-12h12Z" />
          <text x="42" y="108" textAnchor="middle" transform="rotate(-90 42 108)">
            {secondary?.value ?? "—"}
          </text>

          <line x1="350" y1="48" x2="390" y2="28" />
          <path d="m350 48 10-1-5-9Z" />
          <path d="m390 28-10 1 5 9Z" />
          <text x="382" y="58" textAnchor="middle">
            {tertiary?.value ?? "—"}
          </text>
        </svg>
      </div>

      <figcaption>
        <strong>{measurement.label}</strong>
        <dl>
          {measurement.values.map((value) => (
            <div key={value.label}>
              <dt>{value.label}</dt>
              <dd>{value.value}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}

export default async function StudioProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findStudioProduct(slug);
  if (!product) notFound();

  const pathname = `/studio/produtos/${product.slug}`;
  const canonical = absoluteSiteUrl(pathname);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.summary,
    image: product.images.map((image) => image.src),
    material: product.materials.join(", "),
    category: product.contextLabel,
    ...(canonical ? { url: canonical } : {}),
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value
    }))
  };

  return (
    <article className={styles.page}>
      <StudioBreadcrumbs
        currentLabel={product.title}
        pathname={pathname}
        parents={[{ name: "Produtos", href: "/studio/produtos" }]}
      />

      <ProductDetail product={product} />

      <section className={styles.techGrid} aria-label="Informações técnicas do produto">
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <p>Medidas</p>
            <h2>Dimensões</h2>
          </div>
          <div className={styles.measurementGrid}>
            {product.measurements.map((measurement) => (
              <MeasurementDiagram
                key={measurement.label}
                measurement={measurement}
              />
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <p>Ficha técnica</p>
            <h2>Detalhes da peça</h2>
          </div>
          <dl className={styles.specs}>
            {product.specs.map((spec) => (
              <div key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.description}>
        <div>
          <p className={styles.sectionLabel}>Descrição</p>
          <h2>Como essa peça funciona no dia a dia</h2>
        </div>
        <p>{product.description}</p>
      </section>

      <section className={styles.quote}>
        <div>
          <p className={styles.sectionLabel}>Projeto personalizado</p>
          <h2>Precisa de algo parecido, mas com outra medida?</h2>
          <p>
            Produto pronto e projeto sob medida são jornadas diferentes. Se esta peça
            resolve quase tudo, mas precisa mudar tamanho, divisão ou encaixe, mande a
            necessidade para análise.
          </p>
        </div>
        <PrimaryLink
          href={`/studio/orcamento?origem=produto&referencia=${encodeURIComponent(product.slug)}`}
        >
          Pedir orçamento
        </PrimaryLink>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </article>
  );
}
