import Link from "next/link";
import type { ReactNode } from "react";
import { absoluteSiteUrl } from "@/lib/site-config";
import styles from "./studio-content.module.css";

type StudioBreadcrumbItem = {
  name: string;
  href: string;
};

export function StudioBreadcrumbs({
  currentLabel,
  pathname,
  parents = []
}: {
  currentLabel: string;
  pathname: string;
  parents?: StudioBreadcrumbItem[];
}) {
  const items = [
    { name: "Início", href: "/" },
    { name: "Estúdio", href: "/studio" },
    ...parents,
    { name: currentLabel, href: pathname }
  ];

  const structuredItems = items.flatMap((item, index) => {
    const absolute = absoluteSiteUrl(item.href);
    return absolute
      ? [{
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absolute
        }]
      : [];
  });

  return (
    <>
      <nav className={styles.breadcrumbs} aria-label="Caminho da página">
        <ol>
          {items.map((item, index) => (
            <li key={item.href}>
              {index === items.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href}>{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {structuredItems.length === items.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: structuredItems
            })
          }}
        />
      ) : null}
    </>
  );
}

export function StudioPageShell({
  eyebrow,
  title,
  lead,
  pathname,
  breadcrumbLabel,
  breadcrumbParents,
  children
}: {
  eyebrow: string;
  title: string;
  lead: string;
  pathname: string;
  breadcrumbLabel: string;
  breadcrumbParents?: StudioBreadcrumbItem[];
  children: ReactNode;
}) {
  return (
    <article className={styles.page}>
      <header className={styles.pageHeader}>
        <StudioBreadcrumbs
          currentLabel={breadcrumbLabel}
          pathname={pathname}
          parents={breadcrumbParents}
        />
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </header>
      {children}
    </article>
  );
}

export function StudioSection({
  eyebrow,
  title,
  children,
  id
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={styles.section} id={id}>
      {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
      <h2>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export function MediaPlaceholder({
  kind,
  note
}: {
  kind: "user-photo" | "generated-asset" | "diagram";
  note: string;
}) {
  const label =
    kind === "user-photo"
      ? "FOTO REAL PENDENTE"
      : kind === "diagram"
        ? "DIAGRAMA PENDENTE"
        : "ASSET VISUAL PENDENTE";

  const source =
    kind === "user-photo"
      ? "Você envia a foto final."
      : kind === "diagram"
        ? "Podemos produzir o diagrama depois."
        : "Podemos gerar/desenhar este asset depois.";

  return (
    <figure className={styles.mediaPlaceholder} data-media-source={kind}>
      <div className={styles.mediaPlaceholderFrame} aria-hidden="true" />
      <figcaption>
        <strong>{label}</strong>
        <span>{note}</span>
        <small>{source}</small>
      </figcaption>
    </figure>
  );
}


export function StudioMaterialGuidance() {
  return (
    <StudioSection eyebrow="Materiais & cores" title="A escolha vem depois da função.">
      <p>
        Material, cor e acabamento dependem do uso da peça, das dimensões e das condições
        de produção. Não exibimos uma grade genérica de materiais como se toda combinação
        estivesse automaticamente disponível.
      </p>
      <TextList>
        <li>Se você já tem preferência de material, cor ou acabamento, informe no orçamento.</li>
        <li>Se não souber, marque que precisa de orientação e avaliamos junto com o projeto.</li>
        <li>Disponibilidade e combinação final só são confirmadas durante a análise.</li>
      </TextList>
    </StudioSection>
  );
}

export function PrimaryLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className={styles.primaryLink} href={href}>
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function TextList({ children }: { children: ReactNode }) {
  return <ul className={styles.textList}>{children}</ul>;
}
