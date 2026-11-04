"use client";

import { useState } from "react";
import carouselStyles from "../estudio/page.module.css";
import styles from "./products.module.css";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0);
  const canNavigate = images.length > 1;
  const showImage = (step: number) => setSelected((current) => (current + step + images.length) % images.length);

  return (
    <div className={styles.gallery}>
      <div className={styles.heroImage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[selected]} alt={`${name}, imagem ${selected + 1} de ${images.length}`} width="800" height="1000" fetchPriority="high" />
        {canNavigate && <>
          <button className={`${carouselStyles.arrow} ${styles.galleryPrevious}`} type="button" aria-label="Imagem anterior" onClick={() => showImage(-1)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className={`${carouselStyles.arrow} ${styles.galleryNext}`} type="button" aria-label="Próxima imagem" onClick={() => showImage(1)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m9.5 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>}
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
