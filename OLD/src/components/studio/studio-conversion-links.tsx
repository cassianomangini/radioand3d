import Link from "next/link";
import styles from "./studio-editorial.module.css";

export function StudioConversionLinks() {
  return (
    <div className={styles.conversionLinks}>
      <Link className={styles.quoteLink} href="/studio/orcamento">
        <span><strong>Pedir orçamento</strong><small>Uma peça feita para o seu projeto</small></span>
        <span aria-hidden="true">→</span>
      </Link>
      <Link className={styles.productsLink} href="/studio/produtos">
        <span><strong>Ver produtos</strong><small>Compra finalizada na Shopee</small></span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
