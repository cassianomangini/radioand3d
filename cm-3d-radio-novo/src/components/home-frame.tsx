import Image from "next/image";
import { ButtonLink } from "./button";
import styles from "../app/page.module.css";

export function HomeFrame() {
  return (
    <section className={styles.homeHero} aria-label="Apresentação do CMangini3D">
      <div className={styles.copy}>
        <h1>
          Caixas sob medida.
          <br />
          Placas personalizadas.
          <br />
          <span className={styles.highlight}>Impressão 3D.</span>
        </h1>
        <ul className={styles.featureGrid} aria-label="Informações sobre o CMangini3D">
          <li className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg></span>
            <span className={styles.featureText}><small>Retirada em</small><strong>São Caetano do Sul</strong><small>ABC Paulista</small></span>
          </li>
          <li className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg></span>
            <span className={styles.featureText}><small>Entrega em</small><strong>Todo o Brasil</strong><small>Envio pelos correios ou Shopee</small></span>
          </li>
          <li className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8ZM12 8 7.26 5.15M12 8l4.74-2.85M12 13.5V8" /></svg></span>
            <span className={styles.featureText}><small>Personalização</small><strong>Caixas, placas, logos</strong><small>Produzidos sob medida</small></span>
          </li>
          <li className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v1M12 8h8M15 20v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3M4 20h16M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18M4 8h4" /><path d="M8.635 10.093A2 2 0 0 1 8 8.631V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-1 1a1 1 0 0 1-1.414 0Z" /></svg></span>
            <span className={styles.featureText}><small>Impressão 3D</small><strong>Seu projeto em 3D </strong><small>Envie sua ideia ou seu arquivo</small></span>
          </li>
        </ul>
        <div className={styles.actions}>
          <ButtonLink href="/orcamentos" variant="primary">Pedir orçamento</ButtonLink>
          <ButtonLink href="/estudio" variant="secondary">Conhecer o Estúdio</ButtonLink>
        </div>
        <p>
          Nossos produtos também estão
          disponíveis na{" "}
          <a className={styles.shopeeLink} href="https://shopee.com.br/artesopolis">
            <strong>Shopee.</strong>
          </a>
        </p>
      </div>
      <figure className={styles.homeVisual}>
        <Image
          src="/images/studio/home-background-teste2.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </figure>
    </section>
  );
}
