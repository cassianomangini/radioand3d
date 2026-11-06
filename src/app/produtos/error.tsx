"use client";

import Link from "next/link";
import styles from "./products.module.css";

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.empty} role="alert">
          <h1>Catálogo temporariamente indisponível</h1>
          <p>Não conseguimos carregar os produtos agora. Você pode tentar novamente.</p>
          <button className={styles.primaryAction} type="button" onClick={reset}>
            Tentar novamente
          </button>
          <Link href="/estudio">Conhecer o Estúdio</Link>
        </div>
      </div>
    </div>
  );
}
