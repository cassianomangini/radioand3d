import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "./foundation.module.css";

export default function FoundationPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Ambiente de desenvolvimento</p>
        <h1>CM visual foundation</h1>
        <p>
          Esta vitrine valida arquitetura de tokens e estados. Não é uma proposta
          de identidade final.
        </p>
      </header>

      <section className={styles.panel} aria-labelledby="actions-title">
        <div>
          <p className={styles.kicker}>Primitiva real</p>
          <h2 id="actions-title">Ações</h2>
        </div>
        <div className={styles.actions}>
          <Button>Primária</Button>
          <Button variant="secondary">Secundária</Button>
          <Button variant="quiet">Quiet</Button>
          <Button loading>Processando</Button>
          <Button disabled>Indisponível</Button>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="surfaces-title">
        <div>
          <p className={styles.kicker}>Tokens semânticos</p>
          <h2 id="surfaces-title">Superfícies e texto</h2>
        </div>
        <div className={styles.surfaceGrid}>
          <article className={styles.surface}>
            <strong>Panel</strong>
            <span>Texto secundário legível sobre a superfície.</span>
          </article>
          <article className={styles.media}>
            <strong>Media</strong>
            <span>Espaço reservado para foto/material real.</span>
          </article>
        </div>
      </section>
    </main>
  );
}
