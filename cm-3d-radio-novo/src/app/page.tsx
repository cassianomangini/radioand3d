import Image from "next/image";
import { SiteHeader } from "../components/site-header";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className={styles.stage}>
        <Image
          className={styles.background}
          src="/images/studio/fundo_pagina_estudio_3.png"
          alt="Estúdio com a Bambu Lab X1 Carbon e o robô X1. O balão diz: seja muito bem-vindo."
          width={1920}
          height={765}
          priority
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </main>
    </>
  );
}
