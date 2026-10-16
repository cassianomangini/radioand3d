"use client";

import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion
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
};

export function StudioPrintsCarousel({ active, media = studioPrintMedia }: Props) {
  const [index, setIndex] = useState(0);
  const [restart, setRestart] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [overControls, setOverControls] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const reducedMotion = useReducedMotion();

  const progress = useMotionValue(0);
  const clockRef = useRef<ReturnType<typeof animate> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = media.length;
  const currentIndex = total > 0 ? index % total : 0;
  const current = media[currentIndex] ?? null;
  const canNavigate = total > 1;
  const slideDuration = current?.kind === "video" ? VIDEO_DURATION_SECONDS : PHOTO_DURATION_SECONDS;

  // Reduced-motion removes transitions, not the gallery's explicitly requested
  // initial PLAY state. A visible Pause control always remains available.
  const advancing = active && canNavigate && playing && documentVisible &&
    inViewport && !overControls && !keyboardFocus;

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
      onComplete: () => setIndex((previous) => (previous + 1) % total)
    });
    clockRef.current = clock;
    return () => {
      clock.stop();
      if (clockRef.current === clock) clockRef.current = null;
    };
  }, [current?.id, canNavigate, total, restart, progress, slideDuration]);

  useEffect(() => {
    if (advancing) clockRef.current?.play();
    else clockRef.current?.pause();
  }, [advancing, current?.id, restart]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || !playing || !documentVisible || !inViewport || keyboardFocus) {
      video.pause();
      return;
    }
    // Presentation videos never interrupt the Radio's audio.
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [active, playing, documentVisible, inViewport, keyboardFocus, current?.id]);

  function goTo(requested: number) {
    if (!canNavigate) return;
    setIndex((requested + total) % total);
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
    const target = selected.offsetLeft + selected.offsetWidth / 2 - rail.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "instant" });
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
        <AnimatePresence initial={false} mode="sync">
          {current ? (
            <motion.div
              key={current.id}
              className={styles.mediaSlide}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
            >
              {current.kind === "image" ? (
                <>
                  <Image
                    className={styles.ambientImage}
                    src={current.src}
                    alt=""
                    fill
                    sizes="(max-width: 1179px) 100vw, 65vw"
                    aria-hidden="true"
                  />
                  <Image
                    className={styles.photo}
                    src={current.src}
                    alt=""
                    fill
                    sizes="(max-width: 1179px) 100vw, 65vw"
                    priority={active && currentIndex === 0}
                  />
                </>
              ) : (
                <>
                  {current.poster ? (
                    <Image
                      className={styles.ambientImage}
                      src={current.poster}
                      alt=""
                      fill
                      sizes="(max-width: 1179px) 100vw, 65vw"
                      aria-hidden="true"
                    />
                  ) : null}
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
                </>
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
        <a
          className={styles.mediaLink}
          href="#impressoes"
          aria-label={`Abrir na galeria: ${current.title}`}
          tabIndex={active ? 0 : -1}
        />
      ) : null}

      {current && canNavigate ? (
        <>
          <span className={styles.counter} aria-hidden="true">
            <span className={styles.counterNow}>{String(currentIndex + 1).padStart(2, "0")}</span>
            <span className={styles.counterSeparator}>/</span>
            {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={`${styles.arrow} ${styles.previous}`}
            aria-label="Impressão anterior"
            onClick={() => goTo(currentIndex - 1)}
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="previous" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Próxima impressão"
            onClick={() => goTo(currentIndex + 1)}
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
            tabIndex={active ? 0 : -1}
          >
            <Chevron direction="next" />
          </button>
        </>
      ) : null}

      <div className={styles.titleBlock}>
        <span className={styles.kicker}>ESTÚDIO DE IMPRESSÃO 3D</span>
        <h2>Impressões</h2>
      </div>

      <div className={styles.caption}>
        <p>{current ? current.title : "Veja peças que já saíram das impressoras, com contexto real de produção."}</p>
        <div className={styles.bottomLine}>
          <a
            className={styles.explore}
            href="#impressoes"
            tabIndex={active ? 0 : -1}
            onPointerEnter={() => setOverControls(true)}
            onPointerLeave={() => setOverControls(false)}
          >
            Explorar galeria <span aria-hidden="true">→</span>
          </a>
          {canNavigate ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
