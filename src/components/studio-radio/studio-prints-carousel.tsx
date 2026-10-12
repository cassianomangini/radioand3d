"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { studioPrintMedia } from "@/features/studio/prints-media";
import styles from "./studio-prints-carousel.module.css";

const IMAGE_INTERVAL_MS = 6500;
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

export function StudioPrintsCarousel({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = studioPrintMedia.length;
  const current = studioPrintMedia[index] ?? null;
  const canNavigate = total > 1;
  const autoAdvance = active && canNavigate && !paused && !interacting && !reducedMotion && documentVisible;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => setReducedMotion(query.matches);
    onPreference();
    query.addEventListener("change", onPreference);
    return () => query.removeEventListener("change", onPreference);
  }, []);

  useEffect(() => {
    const onVisibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
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
    if (!active || !documentVisible || reducedMotion) {
      video.pause();
      return;
    }
    // Decorative, muted previews never take audio focus from the Radio.
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [active, documentVisible, index, reducedMotion]);

  const goTo = (requested: number) => {
    setIndex((requested + total) % total);
  };
  const visibleDots = total <= 6
    ? studioPrintMedia.map((_, offset) => offset)
    : Array.from({ length: 5 }, (_, offset) =>
        Math.min(Math.max(index - 2, 0), total - 5) + offset
      );

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      data-studio-prints-carousel="true"
      data-has-media={current ? "true" : "false"}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      aria-label="Destaques de impressões do Estúdio"
    >
      <div className={styles.mediaLayer} aria-hidden="true">
        {current ? (
          current.kind === "image" ? (
            <Image
              key={current.src}
              className={styles.photo}
              src={current.src}
              alt=""
              fill
              priority={index === 0}
              sizes="(max-width: 1179px) 100vw, 60vw"
            />
          ) : (
            // The preview is muted/decorative. The gallery controls the original video.
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              key={current.src}
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
          )
        ) : (
          <span className={styles.emptyMediaLabel}>FOTO REAL PENDENTE · PEÇA PRODUZIDA</span>
        )}
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
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="previous" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Próxima impressão"
            onClick={() => goTo(index + 1)}
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
          <Link className={styles.explore} href="/studio/impressoes" tabIndex={active ? 0 : -1}>
            Explorar galeria <span aria-hidden="true">→</span>
          </Link>
          {canNavigate ? (
            <div className={styles.pagination}>
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
                aria-label={paused ? "Retomar carrossel automático" : "Pausar carrossel automático"}
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
                tabIndex={active ? 0 : -1}
              >
                {paused ? "▶" : "Ⅱ"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
