"use client";

import Image from "next/image";
import styles from "./studio-home-art.module.css";

/** Decorative, full-bleed Home asset. Never owns navigation or Radio state. */
export function StudioHomeArt() {
  return (
    <div className={styles.art} data-home-art="true" aria-hidden="true">
      <Image
        src="/images/studio/imagem_principal_fundo23.png"
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized
      />
    </div>
  );
}
