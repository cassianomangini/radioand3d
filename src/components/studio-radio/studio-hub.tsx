"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import styles from "./studio-radio-shell.module.css";
import { StudioPrintsCarousel } from "./studio-prints-carousel";

// The visual hub remains mounted while the user navigates. Motion owns
// entrance/exit only; the player is managed outside this component.
const StudioMotionLink = motion.create(Link);

const studioHubRailVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.16, delayChildren: 0.12 } }
};

const studioHubCardVariants: Variants = {
  hidden: (side: "left" | "right") => ({
    opacity: 0,
    x: side === "left" ? -48 : 42,
    y: 22,
    scale: 0.975,
    transition: { duration: 0.24 }
  }),
  shown: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] }
  }
};

const studioHubInstantVariants: Variants = {
  hidden: { opacity: 0, x: 0, y: 0, scale: 1 },
  shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0 } }
};


export function StudioHub({
  active,
  radioFullscreen,
  reducedMotion
}: {
  active: boolean;
  radioFullscreen: boolean;
  reducedMotion: boolean;
}) {
  return (
          <motion.div
            className={styles.studioDetailRail}
            aria-hidden={!active}
            inert={!active}
            data-studio-motion-owner="motion"
            initial={reducedMotion ? false : "hidden"}
            animate={active ? "shown" : "hidden"}
            variants={reducedMotion ? undefined : studioHubRailVariants}
          >
            <motion.section
              className={styles.studioDetailCard}
              data-studio-card="prints"
              aria-label="Impressões em destaque"
              custom="left"
              variants={reducedMotion ? studioHubInstantVariants : studioHubCardVariants}
            >
              <StudioPrintsCarousel active={active && !radioFullscreen} />
            </motion.section>

            <StudioMotionLink
              className={styles.studioDetailCard}
              data-studio-card="quote"
              custom="right"
              variants={reducedMotion ? studioHubInstantVariants : studioHubCardVariants}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.992 }}
              href="/studio/orcamento"
              aria-label="Pedir orçamento"
              tabIndex={active ? 0 : -1}
            >
              <Image
                className={styles.studioQuotePhoto}
                src="/images/studio/orcamento-card.png"
                alt=""
                fill
                sizes="(max-width: 1179px) 100vw, 32vw"
              />
              <div className={styles.studioCardHead}>
                <span className={styles.studioCardLabel}>PROJETO PERSONALIZADO</span>
                <strong>Peça um orçamento</strong>
              </div>
              <div className={styles.studioCardFoot}>
                <p>Conte o que você precisa. O fluxo pergunta somente o que faz sentido para o projeto.</p>
                <span className={styles.studioCardAction}>Pedir orçamento →</span>
              </div>
            </StudioMotionLink>

            <StudioMotionLink
              className={styles.studioDetailCard}
              data-studio-card="products"
              custom="right"
              variants={reducedMotion ? studioHubInstantVariants : studioHubCardVariants}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.992 }}
              href="/studio/produtos"
              aria-label="Ver produtos do estúdio"
              tabIndex={active ? 0 : -1}
            >
              <div className={styles.studioCardHead}>
                <span className={styles.studioCardLabel}>PRODUTOS</span>
                <strong>Peças prontas para comprar</strong>
              </div>
              <div className={styles.studioCardFoot}>
                <span className={styles.studioCardMediaPlaceholder} aria-hidden="true">
                  FOTO REAL PENDENTE · produto
                </span>
                <p>Conheça cada produto aqui e finalize a compra na Shopee quando estiver disponível.</p>
                <span className={styles.studioCardAction}>Ver produtos →</span>
              </div>
            </StudioMotionLink>
          </motion.div>
  );
}
