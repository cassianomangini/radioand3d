import Image from "next/image";
import { Button } from "./button";
import styles from "../app/page.module.css";

export function HomeFrame() {
  return (
    <>
      <Image
        className={styles.background}
        src="/images/studio/fundo_t2.png"
        alt="Estúdio com a Bambu Lab X1 Carbon e o robô X1. O balão diz: seja muito bem-vindo."
        fill
        priority
        unoptimized
      />
      <Image
        className={styles.mobileHero}
        src="/images/studio/fundo_mobile_home.png"
        alt="Estúdio com a Bambu Lab X1 Carbon e o robô X1. O balão diz: seja muito bem-vindo."
        width={913}
        height={722}
        unoptimized
      />
      <div className={styles.copy}>
        <h1>
          Caixas sob medida.
          <br />
          Placas personalizadas.
          <br />
          <span className={styles.highlight}>Impressão 3D</span> sob encomenda.
        </h1>
        <p>
          Conte o que você precisa em poucos passos e solicite um orçamento para sua peça personalizada.
        </p>
        <p>
          Conheça também os produtos disponíveis na nossa loja.
        </p>
        <div className={styles.actions}>
          <Button variant="primary">Pedir orçamento</Button>
          <Button variant="secondary">Conhecer produtos</Button>
        </div>
        <p className={styles.radioLine}>
          <svg className={styles.musicIcon} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id="radio-music-icon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-cyan)" />
                <stop offset="100%" stopColor="var(--accent-violet)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#radio-music-icon)"
              d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
            />
          </svg>
          <span>Aproveite também a CM Rádio com músicas autorais!</span>
          <svg className={styles.musicIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="url(#radio-music-icon)"
              d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
            />
          </svg>
        </p>
      </div>
    </>
  );
}
