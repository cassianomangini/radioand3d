import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./studio-content.module.css";

export function StudioPageShell({
  eyebrow,
  title,
  lead,
  children
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <article className={styles.page}>
      <header className={styles.pageHeader}>
        <Link className={styles.backLink} href="/studio">
          <span aria-hidden="true">←</span>
          <span>Voltar ao Estúdio</span>
        </Link>
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
