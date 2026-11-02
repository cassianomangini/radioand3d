import type { Metadata } from "next";
import { QuoteFlow } from "./quote-flow";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Orçamentos — CM 3D & Rádio",
};

export default function OrcamentosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1>Orçamentos</h1>
          <p>Conte sua ideia e receba uma proposta sob medida.</p>
        </div>
      </header>

      <QuoteFlow />
    </div>
  );
}
