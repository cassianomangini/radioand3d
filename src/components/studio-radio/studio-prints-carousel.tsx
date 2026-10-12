"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { studioPrintMedia, type StudioPrintMedia } from "@/features/studio/prints-media";
import styles from "./studio-prints-carousel.module.css";

const IMAGE_INTERVAL_MS = 5600;
const VIDEO_INTERVAL_MS = 10000;

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "previous" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RotationIcon({ rotating }: { rotating: boolean }) {
  return rotating ? (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M8 4.5a1 1 0 0 1 1.5-.86l10 7a1.5 1.5 0 0 1 0 2.46l-10 7A1 1 0 0 1 8 19.24V4.5Z" />
    </svg>
  );
}

type Props = {
  active: boolean;
  /** Isolated QA uses explicit fixtures. The public hub always uses real imported media. */
  media?: readonly StudioPrintMedia[];
};

export function StudioPrintsCarousel({ active, media = studioPrintMedia }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [explicitlyStarted, setExplicitlyStarted] = useState(false);
  const [controlHover, setControlHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const total = media.length;
  const current = media[index] ?? null;
  const canNavigate = total > 1;
  const rotationRequested = !paused && (!reducedMotion || explicitlyStarted);
  const autoAdvance =
    active && canNavigate && rotationRequested && !controlHover &&
    !focusWithin && documentVisible && inViewport;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => setReducedMotion(query.matches);
    onPreference();
    query.addEventListener("change", onPreference);
    return () => query.removeEventListener("change", onPreference);
  }, []);

  useEffect(() => {
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.75] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setTimeout(
      () => setIndex((previous) => (previous + 1) % total),
      current?.kind === "video" ? VIDEO_INTERVAL_MS : IMAGE_INTERVAL_MS
    );
    return () => window.clearTimeout(timer);
  }, [autoAdvance, current?.kind, index, total]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || !documentVisible || !inViewport || reducedMotion || paused) {
      video.pause();
      return;
    }
    // Previews are always muted. Radio remains the only active audio source.
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [active, documentVisible, inViewport, index, paused, reducedMotion]);

  const goTo = (requested: number) => {
    setIndex((requested + total) % total);
  };

  const toggleRotation = () => {
    if (rotationRequested) {
      setPaused(true);
      setExplicitlyStarted(false);
    } else {
      setPaused(false);
      setExplicitlyStarted(true);
    }
  };

  const visibleDots = total <= 6
    ? media.map((_, offset) => offset)
    : Array.from({ length: 5 }, (_, offset) =>
        Math.min(Math.max(index - 2, 0), total - 5) + offset
      );

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques de impressões do Estúdio"
      aria-live="off"
      data-studio-prints-carousel="true"
      data-has-media={current ? "true" : "false"}
      data-active-media-id={current?.id ?? undefined}
      data-auto-rotating={autoAdvance ? "true" : "false"}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
    >
      <div className={styles.mediaLayer} aria-hidden="true">
        <AnimatePresence initial={false} mode="sync">
          {current ? (
            <motion.div
              key={current.id}
              className={styles.mediaSlide}
              initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.008 }}
              transition={{ duration: reducedMotion ? 0 : 0.62, ease: "easeInOut" }}
            >
              {current.kind === "image" ? (
                <Image
                  className={styles.photo}
                  src={current.src}
                  alt=""
                  fill
                  priority={active && index === 0}
                  sizes="(max-width: 1179px) 100vw, 60vw"
                />
              ) : (
                <video
                  ref={videoRef}
                  className={styles.photo}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  poster={current.poster}
                  aria-hidden="true"
                >
                  <source src={current.src} type={current.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                </video>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
        {!current ? (
          <span className={styles.emptyMediaLabel}>FOTO REAL PENDENTE · PEÇA PRODUZIDA</span>
        ) : null}
      </div>

      <div className={styles.readability} aria-hidden="true" />
      {current ? (
        <Link
          className={styles.mediaLink}
          href={`/studio/impressoes#${encodeURIComponent(current.id)}`}
          aria-label={`Ver na galeria: ${current.title}`}
          tabIndex={active ? 0 : -1}
        />
      ) : null}

      {current && canNavigate ? (
        <>
          <span className={styles.counter} aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={`${styles.arrow} ${styles.previous}`}
            aria-label="Impressão anterior"
            onClick={() => goTo(index - 1)}
            onPointerEnter={() => setControlHover(true)}
            onPointerLeave={() => setControlHover(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="previous" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Próxima impressão"
            onClick={() => goTo(index + 1)}
            onPointerEnter={() => setControlHover(true)}
            onPointerLeave={() => setControlHover(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="next" />
          </button>
        </>
      ) : null}

      <div className={styles.caption}>
        <span className={styles.kicker}>ESTÚDIO DE IMPRESSÃO 3D</span>
        <h2>Impressões</h2>
        <p>{current ? current.title : "Veja peças que já saíram das impressoras, com contexto real de produção."}</p>
        <div className={styles.bottomLine}>
          <Link
            className={styles.explore}
            href="/studio/impressoes"
            tabIndex={active ? 0 : -1}
            onPointerEnter={() => setControlHover(true)}
            onPointerLeave={() => setControlHover(false)}
          >
            Explorar galeria <span aria-hidden="true">→</span>
          </Link>
          {canNavigate ? (
            <div
              className={styles.pagination}
              onPointerEnter={() => setControlHover(true)}
              onPointerLeave={() => setControlHover(false)}
            >
              <div className={styles.dots} role="group" aria-label="Selecionar impressão">
                {visibleDots.map((dot) => (
                  <button
                    type="button"
                    className={styles.dot}
                    key={dot}
                    data-current={index === dot}
                    aria-label={`Mostrar impressão ${dot + 1} de ${total}`}
                    aria-pressed={index === dot}
                    onClick={() => goTo(dot)}
                    tabIndex={active ? 0 : -1}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.pause}
                aria-label={rotationRequested ? "Pausar carrossel automático" : "Iniciar carrossel automático"}
                aria-pressed={rotationRequested}
                onClick={toggleRotation}
                tabIndex={active ? 0 : -1}
              >
                <RotationIcon rotating={rotationRequested} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
