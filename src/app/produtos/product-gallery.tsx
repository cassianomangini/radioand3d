"use client";

import { useState } from "react";
import styles from "./products.module.css";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0);
  return (
    <div className={styles.gallery}>
      <div className={styles.heroImage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[selected]} alt={`${name}, imagem ${selected + 1} de ${images.length}`} width="800" height="1000" fetchPriority="high" />
      </div>
      {images.length > 1 && <div className={styles.thumbs} role="group" aria-label="Imagens do produto">
        {images.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setSelected(index)}
          aria-label={`Ver imagem ${index + 1} de ${images.length}`} aria-pressed={index === selected}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width="80" height="100" loading="lazy" />
        </button>)}
      </div>}
    </div>
  );
}
