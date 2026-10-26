"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import { SiteHeader } from "./site-header";
import styles from "../app/page.module.css";

export function HomeFrame() {
  const [split, setSplit] = useState(false);

  return (
    <div className={styles.page}>
      <SiteHeader onOpenSplit={() => setSplit(true)} />
      <div className={split ? styles.split : styles.single}>
        <main className={styles.stage}>
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
              Precisa de uma caixa com medidas específicas, uma placa personalizada ou tem um
              arquivo que gostaria de imprimir em 3D?
            </p>
            <p>
              Conte o que você precisa, envie suas medidas ou uma referência e solicite um
              orçamento. Avaliamos cada projeto antes de confirmar a produção.
            </p>
            <div className={styles.actions}>
              <Button variant="primary">Pedir orçamento</Button>
              <Button variant="secondary">Conhecer produtos</Button>
            </div>
            <p className={styles.radioLine}>
              <svg className={styles.musicIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"
                />
              </svg>
              Aproveite também a CM Rádio com músicas autorais!
            </p>
          </div>
        </main>
        {split ? (
          <>
            <div className={styles.bar} />
            <aside className={styles.side}>
              <button
                type="button"
                className={styles.corner}
                onClick={() => setSplit(false)}
              >
                100
              </button>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
