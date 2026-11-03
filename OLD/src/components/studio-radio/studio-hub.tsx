"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { useCallback, useState } from "react";
import { studioProducts } from "@/features/studio/catalog";
import { studioPrintMedia } from "@/features/studio/prints-media";
import { StudioPrintsCarousel } from "./studio-prints-carousel";
import styles from "./studio-hub.module.css";

const StudioMotionLink = motion.create(Link);

function StripChevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "previous" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } }
};

const cards = [
  { id: "quote", title: "Orçamentos", description: "Conte o que você precisa e receba um orçamento.", href: "/studio/orcamento" },
  { id: "products", title: "Produtos", description: "Peças prontas para conhecer e comprar na Shopee.", href: "/studio/produtos" },
  { id: "materials", title: "Materiais", description: "Conheça materiais, cores e acabamentos.", href: "/studio/materiais" },
  { id: "about", title: "O Estúdio", description: "Ideias, impressoras e tecnologia em cada projeto.", href: "/studio/o-estudio" }
] as const;

export function StudioHub({
  active, radioFullscreen, reducedMotion
}: { active: boolean; radioFullscreen: boolean; reducedMotion: boolean }) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [stripOffset, setStripOffset] = useState(0);
  const media = studioPrintMedia;
  const productImage = studioProducts[0]?.images[0];
  const visibleCount = Math.min(media.length, 9);
  const lastPageOffset = visibleCount ? Math.floor((media.length - 1) / visibleCount) * visibleCount : 0;

  const selectPhoto = useCallback((index: number) => {
    setSelectedPhoto(index);
    setStripOffset(Math.floor(index / visibleCount) * visibleCount);
  }, [visibleCount]);

  return (
    <motion.div
      className={styles.studioDetailRail}
      aria-hidden={!active}
      inert={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      data-studio-motion-owner="motion"
    >
      <div className={styles.studioTop}>
        <section className={styles.studioDetailCard} data-studio-card="prints" aria-label="Impressões em destaque">
          <StudioPrintsCarousel active={active && !radioFullscreen} selectedIndex={selectedPhoto} onChangeIndex={selectPhoto} />
        </section>
        <nav className={styles.studioActions} data-studio-nav="true" aria-label="Explore o Estúdio">
          {cards.map((card) => (
            <StudioMotionLink
              key={card.id}
              href={card.href}
              className={styles.studioDetailCard}
              data-studio-card={card.id}
              variants={reducedMotion ? undefined : cardVariants}
              initial={false}
              animate="shown"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              tabIndex={active ? 0 : -1}
            >
              <span className={styles.cardVisual} aria-hidden="true">
                {card.id === "quote" ? (
                  <Image src="/images/studio/orcamento-card.png" alt="" fill sizes="130px" className={styles.cardImage} />
                ) : card.id === "products" && productImage ? (
                  <Image src={productImage.src} alt="" fill sizes="130px" className={styles.cardImage} />
                ) : card.id === "materials" ? (
                  <span className={styles.materialSamples}><i /><i /><i /></span>
                ) : (
                  <Image src="/images/cm-3d-radio-logo.png" alt="" fill sizes="130px" className={styles.cardImage} />
                )}
              </span>
              <span className={styles.cardCopy}>
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </span>
            </StudioMotionLink>
          ))}
        </nav>
      </div>
      <section className={styles.mediaStrip} data-studio-media-strip="true" aria-label="Fotos do estúdio">
        <div className={styles.stripHeader}>
          <h2>Fotos do estúdio</h2>
          <Link href="/studio/impressoes" tabIndex={active ? 0 : -1}>Ver todos <span aria-hidden="true">›</span></Link>
        </div>
        {media.length ? (
          <div className={styles.stripCarousel}>
            <button type="button" className={styles.stripStep} aria-label="Miniaturas anteriores" disabled={stripOffset === 0} onClick={() => setStripOffset((v) => Math.max(0, v - visibleCount))}><StripChevron direction="previous" /></button>
            <div className={styles.stripItems}>
              {Array.from({ length: visibleCount }, (_, localIndex) => {
                const index = (stripOffset + localIndex) % media.length;
                const item = media[index];
                return (
                  <button key={item.id} className={styles.thumbnail} data-studio-thumbnail={index} type="button"
                    aria-pressed={selectedPhoto === index}
                    aria-label={`Mostrar imagem: ${item.title}`}
                    onClick={() => selectPhoto(index)}>
                    {item.kind === "image" ? <Image src={item.src} alt="" fill sizes="120px" /> : <video src={item.src} muted playsInline preload="metadata" />}
                  </button>
                );
              })}
            </div>
            <button type="button" className={styles.stripStep} aria-label="Próximas miniaturas" disabled={stripOffset === lastPageOffset} onClick={() => setStripOffset((v) => Math.min(lastPageOffset, v + visibleCount))}><StripChevron direction="next" /></button>
          </div>
        ) : <p className={styles.emptyMedia}>Fotos reais do Estúdio em preparação.</p>}
      </section>
    </motion.div>
  );
}
