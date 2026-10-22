"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { studioPrintMedia, type StudioPrintMedia } from "@/features/studio/prints-media";
import styles from "./studio-prints-carousel.module.css";

// A gallery has a playback timeline, not an unexplained setTimeout.
const PHOTO_DURATION_SECONDS = 4.8;
const VIDEO_DURATION_SECONDS = 9;

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

function PlaybackSymbol({ playing }: { playing: boolean }) {
  return playing ? (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4.5" width="4.2" height="15" rx="1" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1" />
    </svg>
  ) : (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 4.75a1 1 0 0 1 1.52-.85l10.1 6.83a1.55 1.55 0 0 1 0 2.57l-10.1 6.83a1 1 0 0 1-1.52-.86V4.75Z" />
    </svg>
  );
}

type Props = {
  active: boolean;
  /** Technical QA can supply its own fixtures; the public Studio uses imported real photos. */
  media?: readonly StudioPrintMedia[];
  selectedIndex?: number | null;
  onChangeIndex?: (index: number) => void;
};

export function StudioPrintsCarousel({ active, media = studioPrintMedia, selectedIndex = null, onChangeIndex }: Props) {
  const [index, setIndex] = useState(0);
  const [restart, setRestart] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [overControls, setOverControls] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const [zoomItem, setZoomItem] = useState<StudioPrintMedia | null>(null);

  const progress = useMotionValue(0);
  const clockRef = useRef<ReturnType<typeof animate> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const zoomDialogRef = useRef<HTMLDialogElement>(null);
  const total = media.length;
  const currentIndex = total > 0 ? (selectedIndex ?? index) % total : 0;
  const current = media[currentIndex] ?? null;
  const canNavigate = total > 1;
  const slideDuration = current?.kind === "video" ? VIDEO_DURATION_SECONDS : PHOTO_DURATION_SECONDS;

  const advancing = active && canNavigate && playing && documentVisible &&
    inViewport && !overControls && !keyboardFocus && !zoomItem;

  useEffect(() => {
    if (zoomItem && !zoomDialogRef.current?.open) zoomDialogRef.current?.showModal();
  }, [zoomItem]);

  useEffect(() => {
    if (!active) zoomDialogRef.current?.close();
  }, [active]);

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
      ([entry]) => setInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 0.65] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Motion's playback controls preserve elapsed time on a temporary pause.
  // A manual seek or completed slide creates a new progress clock.
  useEffect(() => {
    progress.set(0);
    if (!canNavigate) return;
    const clock = animate(progress, 1, {
      duration: slideDuration,
      ease: "linear",
      autoplay: false,
      onComplete: () => {
        const nextIndex = (currentIndex + 1) % total;
        setIndex(nextIndex);
        onChangeIndex?.(nextIndex);
      }
    });
    clockRef.current = clock;
    return () => {
      clock.stop();
      if (clockRef.current === clock) clockRef.current = null;
    };
  }, [current?.id, currentIndex, canNavigate, total, restart, progress, slideDuration, onChangeIndex]);

  useEffect(() => {
    if (advancing) clockRef.current?.play();
    else clockRef.current?.pause();
  }, [advancing, current?.id, restart]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || !playing || !documentVisible || !inViewport || keyboardFocus || zoomItem) {
      video.pause();
      return;
    }
    // Presentation videos never interrupt the Radio's audio.
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [active, playing, documentVisible, inViewport, keyboardFocus, zoomItem, current?.id]);

  function goTo(requested: number) {
    if (!canNavigate) return;
    const nextIndex = (requested + total) % total;
    setIndex(nextIndex);
    onChangeIndex?.(nextIndex);
    setRestart((value) => value + 1);
  }

  const visibleSteps = total <= 7
    ? Array.from({ length: total }, (_, offset) => offset)
    : Array.from({ length: 7 }, (_, offset) =>
        Math.min(Math.max(currentIndex - 3, 0), total - 7) + offset
      );

  useEffect(() => {
    const rail = timelineRef.current;
    const selected = rail?.querySelector<HTMLElement>('[data-current="true"]');
    if (!rail || !selected) return;
    const selectedBounds = selected.getBoundingClientRect();
    const railBounds = rail.getBoundingClientRect();
    const target = rail.scrollLeft + selectedBounds.left - railBounds.left + selectedBounds.width / 2 - rail.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "auto" });
  }, [currentIndex, total]);

  return (
    <div
      className={styles.carousel}
      ref={rootRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Trabalhos reais de impressão 3D"
      aria-live="off"
      data-studio-prints-carousel="true"
      data-has-media={current ? "true" : "false"}
      data-active-media-id={current?.id ?? undefined}
      data-auto-rotating={advancing ? "true" : "false"}
      data-carousel-playing={playing ? "true" : "false"}
      onPointerDownCapture={() => setKeyboardFocus(false)}
      onFocusCapture={(event) => {
        if ((event.target as HTMLElement).matches(":focus-visible")) setKeyboardFocus(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
      }}
    >
      <div className={styles.mediaLayer} aria-hidden="true">
        {current ? (
          <div className={styles.mediaSlide}>
            {current.kind === "image" ? (
              <Image
                className={styles.photo}
                src={current.src}
                alt=""
                fill
                sizes="(max-width: 1179px) 100vw, 65vw"
                priority={active && currentIndex === 0}
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
                <source
                  src={current.src}
                  type={current.src.endsWith(".webm") ? "video/webm" : "video/mp4"}
                />
              </video>
            )}
          </div>
        ) : null}
        {!current ? (
          <span className={styles.emptyMediaLabel}>FOTO REAL PENDENTE · PEÇA PRODUZIDA</span>
        ) : null}
      </div>

      {current ? (
        <button
          type="button"
          className={styles.mediaZoom}
          aria-label={`Ampliar ${current.kind === "image" ? "foto" : "vídeo"}: ${current.title}`}
          onClick={() => setZoomItem(current)}
          tabIndex={active ? 0 : -1}
        />
      ) : null}

      {canNavigate ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Impressão anterior"
            onClick={() => goTo(currentIndex - 1)}
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="previous" />
          </button>
          <div
            className={styles.transport}
            role="group"
            aria-label="Controles da apresentação de Impressões"
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
          >
            <div ref={timelineRef} className={styles.timeline} role="group" aria-label="Escolher impressão">
              {visibleSteps.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={styles.timelineStep}
                  aria-label={`Mostrar impressão ${step + 1} de ${total}: ${media[step].title}`}
                  aria-pressed={step === currentIndex}
                  data-current={step === currentIndex}
                  onClick={() => goTo(step)}
                  tabIndex={active ? 0 : -1}
                >
                  <span className={styles.timelineRail}>
                    {step < currentIndex ? <span className={styles.timelineCompleted} /> : null}
                    {step === currentIndex ? (
                      <motion.span
                        className={styles.timelineFill}
                        style={{ scaleX: progress }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.pause}
              aria-label={playing ? "Pausar apresentação" : "Reproduzir apresentação"}
              aria-pressed={playing}
              onClick={() => setPlaying((state) => !state)}
              tabIndex={active ? 0 : -1}
            >
              <PlaybackSymbol playing={playing} />
            </button>
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Próxima impressão"
            onClick={() => goTo(currentIndex + 1)}
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="next" />
          </button>
        </div>
      ) : null}
      {zoomItem ? (
        <dialog
          ref={zoomDialogRef}
          className={styles.zoomDialog}
          aria-label={zoomItem.title}
          onClose={() => setZoomItem(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <button
            type="button"
            className={styles.zoomClose}
            aria-label="Fechar imagem ampliada"
            onClick={() => zoomDialogRef.current?.close()}
          >
            ×
          </button>
          <div className={styles.zoomContent}>
            {zoomItem.kind === "image" ? (
              <Image src={zoomItem.src} alt={zoomItem.alt} fill sizes="94vw" />
            ) : (
              <video src={zoomItem.src} poster={zoomItem.poster} controls playsInline />
            )}
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
