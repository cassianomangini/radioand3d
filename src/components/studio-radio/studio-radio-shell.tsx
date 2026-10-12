"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { flushSync } from "react-dom";
import { motion, useReducedMotion, type Variants } from "motion/react";
import styles from "./studio-radio-shell.module.css";
import { RadioNavbarDock } from "./radio-navbar-dock";
import { StudioPrintsCarousel } from "./studio-prints-carousel";
import { RadioLyrics } from "@/features/radio/radio-lyrics";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";
import { resolveRadioKeyboardCommand } from "@/features/radio/radio-keyboard";
import {
  createRadioSnapPoints,
  getRadioDragMagnet,
  getRadioDragPreview,
  getRadioDockIntent,
  getRadioReleaseTarget,
  type RadioSnapKind
} from "./radio-panel-drag";
import {
  resolveRadioLayoutMode,
  type RadioLayoutMode
} from "./radio-motion-spine";

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

const DEFAULT_RADIO_WIDTH = 480;
const MIN_RADIO_WIDTH = 400;
const MAX_RADIO_WIDTH = 1120;
const MIN_STUDIO_WIDTH = 640;
const RESIZE_GUTTER = 32;
const RADIO_DOCK_FLIGHT_MS = 660;
const RADIO_DOCK_EDGE_RESTORE_PX = 78;

type ViewTransitionLike = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransitionLike;
};

type StudioRouteMotion = "entering" | "exiting" | null;

type MobileRadioMotionState = {
  direction: "opening" | "closing";
  phase: "source" | "destination";
};

type TrackStepKind = "next" | "previous" | "shuffle";

type TrackStepMotionState = {
  kind: TrackStepKind;
  phase: "source" | "destination";
};

type RadioFlipSnapshot = Map<string, DOMRect>;

const RADIO_FLIP_TIMING: Record<string, { open: [number, number]; close: [number, number] }> = {
  header: { open: [0, 480], close: [80, 420] },
  cover: { open: [20, 720], close: [60, 620] },
  progress: { open: [55, 560], close: [45, 500] },
  visualizer: { open: [70, 680], close: [35, 560] },
  "control-shuffle": { open: [95, 520], close: [30, 460] },
  "control-repeat": { open: [105, 520], close: [25, 460] },
  "control-previous": { open: [115, 540], close: [20, 480] },
  "control-play": { open: [125, 580], close: [15, 500] },
  "control-next": { open: [115, 540], close: [20, 480] },
  "control-volume": { open: [105, 520], close: [25, 460] },
  "control-favorite": { open: [95, 520], close: [30, 460] },
  "queue-header": { open: [110, 560], close: [0, 440] },
  "queue-list": { open: [125, 640], close: [0, 520] }
};

function collectRadioFlipSnapshot(panel: HTMLElement): RadioFlipSnapshot {
  const snapshot: RadioFlipSnapshot = new Map();

  panel
    .querySelectorAll<HTMLElement>("[data-radio-motion-key], [data-radio-flip-key]")
    .forEach((element) => {
      const key = element.dataset.radioFlipKey ?? element.dataset.radioMotionKey;
      if (!key || key === "transport") return;
      snapshot.set(key, element.getBoundingClientRect());
    });

  return snapshot;
}

function animateRadioFlip(
  panel: HTMLElement,
  before: RadioFlipSnapshot,
  direction: "opening" | "closing"
) {
  const animations: Animation[] = [];

  panel
    .querySelectorAll<HTMLElement>("[data-radio-motion-key], [data-radio-flip-key]")
    .forEach((element) => {
      const key = element.dataset.radioFlipKey ?? element.dataset.radioMotionKey;
      if (!key || key === "transport") return;

      const previous = before.get(key);
      if (!previous) return;

      const next = element.getBoundingClientRect();
      if (!next.width || !next.height) return;

      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      const sx = Math.max(0.62, Math.min(1.65, previous.width / next.width));
      const sy = Math.max(0.62, Math.min(1.65, previous.height / next.height));
      const moved =
        Math.hypot(dx, dy) > 1.5 ||
        Math.abs(1 - sx) > 0.015 ||
        Math.abs(1 - sy) > 0.015;

      if (!moved) return;

      const [delay, duration] =
        RADIO_FLIP_TIMING[key]?.[direction === "opening" ? "open" : "close"] ??
        (direction === "opening" ? [180, 760] : [80, 640]);

      const animation = element.animate(
        [
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            transformOrigin: "0 0"
          },
          {
            transform: "translate3d(0, 0, 0) scale(1, 1)",
            transformOrigin: "0 0"
          }
        ],
        {
          duration,
          delay,
          easing:
            direction === "opening"
              ? "cubic-bezier(0.16, 1, 0.3, 1)"
              : "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "both"
        }
      );
      animation.id = `cm-radio-layout-${key}`;

      animation.finished
        .catch(() => undefined)
        .finally(() => animation.cancel());
      animations.push(animation);
    });

  return animations;
}

const previewTrack = {
  title: "Limite Elástico",
  artist: "CM",
  duration: "3:52"
} as const;

type SocialIconName = "email" | "instagram" | "shopee";

const socialIcons = [
  { label: "Email", name: "email" },
  { label: "Instagram", name: "instagram" },
  { label: "Shopee", name: "shopee" }
] as const satisfies ReadonlyArray<{ label: string; name: SocialIconName }>;

function SocialGlyph({ name }: { name: SocialIconName }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const
  };

  if (name === "email") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.2" />
        <path d="m4 7.5 8 6 8-6" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.15" cy="6.85" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3.4 8.4h17.2c.8 0 1.4.7 1.3 1.5l-1 10.4a1.9 1.9 0 0 1-1.9 1.7H5a1.9 1.9 0 0 1-1.9-1.7l-1-10.4c-.1-.8.5-1.5 1.3-1.5Z" />
      <path d="M8.1 8.3c.15-3.3 1.8-5.5 3.9-5.5s3.75 2.2 3.9 5.5" />
      <path d="M15.7 12.6c-.4-1-1.4-1.4-2.8-1.2-1.5.3-2.2 1.2-2 2.1.3 1 1.5 1.4 2.7 1.8 1.2.3 2.1.9 1.9 1.9-.2 1.2-1.2 1.9-2.7 1.8-1.3-.1-2.2-.7-2.5-1.6" />
    </svg>
  );
}

function SocialIcons() {
  return (
    <div className={styles.socialIcons} role="group" aria-label="Contato e redes sociais">
      {socialIcons.map(({ label, name }) => (
        <span className={styles.socialIcon} key={label} title={label} data-icon={name}>
          <SocialGlyph name={name} />
        </span>
      ))}
    </div>
  );
}

type IconName = "expand" | "minimize" | "medium" | "close" | "heart" | "shuffle" | "repeat" | "previous" | "play" | "pause" | "next" | "search" | "volume" | "volumeMute";

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
    minimize: <><path d="M4 14h6v6M20 10h-6V4" /><path d="m14 10 7-7M3 21l7-7" /></>,
    medium: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M14 4v16" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    heart: <path d="M20.8 8.6c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    shuffle: <><path d="M3 6h2c5 0 7 12 12 12h4m-4-4 4 4-4 4" /><path d="M3 18h2c1.8 0 3.2-1.5 4.5-3.5M14.5 9.5C15.8 7.5 17.2 6 19 6h2m-4-4 4 4-4 4" /></>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" /><path d="m11 11 1-1v5" /></>,
    previous: <><path d="M5 5v14" /><path d="m19 5-11 7 11 7V5Z" fill="currentColor" stroke="none" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <><rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /></>,
    next: <><path d="M19 5v14" /><path d="m5 5 11 7-11 7V5Z" fill="currentColor" stroke="none" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" /></>,
    volumeMute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6m0-6-5 6" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function clampRadioWidth(shellWidth: number, requested: number) {
  const availableMaximum = Math.max(
    MIN_RADIO_WIDTH,
    shellWidth - MIN_STUDIO_WIDTH - RESIZE_GUTTER
  );

  return Math.min(
    Math.max(requested, MIN_RADIO_WIDTH),
    Math.min(MAX_RADIO_WIDTH, availableMaximum)
  );
}

function getDefaultWidth(shellWidth: number) {
  return clampRadioWidth(
    shellWidth,
    Math.min(DEFAULT_RADIO_WIDTH, Math.round(shellWidth / 3))
  );
}

function getExpandedWidth(shellWidth: number) {
  return clampRadioWidth(shellWidth, shellWidth * 0.6);
}

function shouldIgnoreRadioShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (
    target.closest(
      'input, textarea, select, button, a[href], [contenteditable="true"], [role="slider"]'
    )
  ) {
    return true;
  }
  return target !== document.body && target.tabIndex >= 0;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function formatTrackDuration(seconds?: number) {
  return seconds && Number.isFinite(seconds) && seconds > 0 ? formatTime(seconds) : "—";
}

function revealChars(text: string, startDelayMs: number, stepMs: number) {
  return [...text].map((char, index) => (
    <span
      key={`${startDelayMs}-${index}`}
      className={styles.studioRevealChar}
      style={{ animationDelay: `${startDelayMs + index * stepMs}ms` }}
    >
      {char}
    </span>
  ));
}

function revealPhrase(text: string, startDelayMs: number, stepMs: number) {
  let cursor = 0;
  return text.split(" ").map((word, index, words) => {
    const delay = startDelayMs + cursor * stepMs;
    cursor += word.length + 1;
    return (
      <span key={`${startDelayMs}-word-${index}`} className={styles.studioRevealWord}>
        {revealChars(word, delay, stepMs)}
        {index < words.length - 1 ? " " : null}
      </span>
    );
  });
}

function RadioContent({
  mobile = false,
  focus = false,
  expanded = false,
  onClose,
  onDock,
  onExpand,
  onMedium,
  mobileMotionEndpoint = false,
  trackStepKind,
  onPrevious,
  onNext,
  onReshuffle,
  visualizerActive = true
}: {
  mobile?: boolean;
  focus?: boolean;
  expanded?: boolean;
  onClose?: () => void;
  onDock?: () => void;
  onExpand?: () => void;
  onMedium?: () => void;
  mobileMotionEndpoint?: boolean;
  trackStepKind?: TrackStepKind;
  onPrevious?: () => void;
  onNext?: () => void;
  onReshuffle?: () => void;
  visualizerActive?: boolean;
}) {
  const radio = useRadio();
  const [query, setQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"playlist" | "lyrics">("playlist");
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [trackFlight, setTrackFlight] = useState<{ id: string; phase: "source" | "destination" } | null>(null);
  const trackMotionTokenRef = useRef(0);
  const trackListRef = useRef<HTMLOListElement>(null);
  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const currentTrackId = radio.currentTrack?.id;
  const volumePanelId = mobile ? "mobile-radio-volume" : "desktop-radio-volume";
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const listTracks = radio.playlistTracks
    .map((track, index) => ({ track, position: index + 1 }))
    .filter(({ track }) =>
      `${track.title} ${track.artist}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
    );
  const displayTrack = radio.currentTrack ?? previewTrack;
  const canPlay = Boolean(radio.currentTrack);
  const playing = radio.status === "playing";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const currentArtwork = radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png";
  const displayedPosition = seekPreview ?? radio.position;
  const progress = radio.duration > 0 ? Math.min(100, displayedPosition / radio.duration * 100) : 0;
  const transportPrevious = onPrevious ?? radio.previous;
  const transportNext = onNext ?? radio.next;
  const transportReshuffle = onReshuffle ?? radio.reshuffle;

  useEffect(() => {
    const list = trackListRef.current;
    if (!list || !currentTrackId) return;

    const alignCurrentTrack = () => {
      const row = list.querySelector<HTMLElement>(`[data-track-id="${CSS.escape(currentTrackId)}"]`);
      if (!row || list.clientHeight === 0) return false;
      const paddingTop = Number.parseFloat(getComputedStyle(list).paddingTop) || 0;
      const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top - paddingTop + list.scrollTop;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
      return true;
    };

    if (alignCurrentTrack()) return;

    const observer = new ResizeObserver(() => {
      if (alignCurrentTrack()) observer.disconnect();
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [currentTrackId]);

  function selectTrackWithMotion(trackId: string) {
    if (radio.currentTrack?.id === trackId) {
      radio.select(trackId);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;
    if (reduce || !documentWithTransition.startViewTransition) {
      radio.select(trackId);
      return;
    }

    const token = ++trackMotionTokenRef.current;
    flushSync(() => {
      setTrackFlight({ id: trackId, phase: "source" });
    });

    try {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          radio.select(trackId);
          setTrackFlight({ id: trackId, phase: "destination" });
        });
      });

      void transition.finished.finally(() => {
        if (trackMotionTokenRef.current === token) setTrackFlight(null);
      });
    } catch {
      setTrackFlight(null);
      radio.select(trackId);
    }
  }

  useEffect(() => {
    if (!volumeOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!volumeMenuRef.current?.contains(event.target as Node)) setVolumeOpen(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setVolumeOpen(false);
      volumeButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [volumeOpen]);

  return (
    <div
      className={styles.radioContent}
      data-radio-surface={mobile ? "mobile" : "desktop"}
      data-radio-focus={!mobile && focus ? "true" : undefined}
      data-mobile-panel={mobile ? mobilePanel : undefined}
      data-track-flight={trackFlight?.phase}
      data-track-step={trackStepKind}
      data-mobile-motion-endpoint={mobile && mobileMotionEndpoint ? "true" : undefined}
    >
      <div className={styles.radioHeader} data-radio-motion-key="header">
        <h2><span>CM</span> RÁDIO</h2>

        {onClose ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label={mobile ? "Fechar rádio" : "Voltar ao Estúdio"}
          >
            <Icon name="close" />
          </button>
        ) : null}
        {!mobile && (onDock || onExpand || onMedium) ? (
          <div className={styles.radioLayoutActions}>
            {onDock ? (
              <button
                type="button"
                className={styles.iconButton}
                onClick={onDock}
                aria-label="Recolher a Rádio para a versão pocket"
                title="Versão pocket"
              >
                <Icon name="minimize" />
              </button>
            ) : null}
            {expanded && onMedium ? (
              <button
                type="button"
                className={styles.iconButton}
                onClick={onMedium}
                aria-label="Voltar a Rádio ao tamanho médio"
                title="Tamanho médio"
              >
                <Icon name="medium" />
              </button>
            ) : onExpand ? (
              <button
                type="button"
                className={styles.iconButton}
                onClick={onExpand}
                aria-label="Expandir a Rádio"
                title="Tela cheia"
              >
                <Icon name="expand" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={styles.coverArt}
        data-radio-motion-key="cover"
        data-track-flight-destination={trackFlight?.phase === "destination" ? "true" : undefined}
      >
        <Image src={currentArtwork} alt="Arte visual da CM Rádio" fill sizes="(min-width: 1180px) 720px, 100vw" priority unoptimized />
        <div
          className={styles.coverCaption}
          data-track-flight-destination={trackFlight?.phase === "destination" ? "true" : undefined}
        >
          <strong>{displayTrack.title}</strong>
          <span>{displayTrack.artist}</span>
        </div>
        {!radio.currentTrack || radio.currentTrack.fixture ? <span className={styles.coverBadge}>{radio.currentTrack?.fixture ? "TESTE" : "PRÉVIA"}</span> : null}
      </div>

      <div
        className={styles.progressBlock}
        data-radio-motion-key="progress"
        data-scrubbing={scrubbing ? "true" : undefined}
        style={{ "--seek-progress": `${progress}%` } as CSSProperties}
      >
        <input
          className={styles.progressSeek}
          type="range"
          min={0}
          max={radio.duration || 1}
          step={0.1}
          value={Math.min(displayedPosition, radio.duration || 1)}
          onPointerDown={() => {
            setScrubbing(true);
            setSeekPreview(radio.position);
          }}
          onPointerUp={(event) => {
            radio.seek(Number(event.currentTarget.value));
            setScrubbing(false);
            setSeekPreview(null);
          }}
          onPointerCancel={() => {
            setScrubbing(false);
            setSeekPreview(null);
          }}
          onBlur={() => {
            setScrubbing(false);
            setSeekPreview(null);
          }}
          onChange={(event) => {
            const nextPosition = Number(event.target.value);
            if (scrubbing) {
              setSeekPreview(nextPosition);
            } else {
              radio.seek(nextPosition);
            }
          }}
          disabled={!canPlay || radio.duration === 0}
          aria-label="Posição da música"
          aria-keyshortcuts="ArrowLeft ArrowRight J L"
          aria-valuetext={formatTime(displayedPosition)}
        />
        <output className={styles.seekPreview} aria-hidden="true">
          {formatTime(displayedPosition)}
        </output>
        <div className={styles.progressTimes}>
          <span>{formatTime(displayedPosition)}</span>
          <span>{canPlay ? formatTrackDuration(radio.duration) : previewTrack.duration}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles da rádio" data-radio-motion-key="transport">
        <button type="button" className={styles.modeButton} data-radio-flip-key="control-shuffle" onClick={transportReshuffle} disabled={radio.tracks.length < 2} aria-label="Embaralhar e trocar de música" data-tooltip="Embaralhar e trocar de música"><Icon name="shuffle" /></button>
        <button type="button" className={styles.modeButton} data-radio-flip-key="control-repeat" onClick={radio.toggleRepeatOne} disabled={!canPlay} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa" title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}><Icon name="repeat" /></button>
        <button type="button" data-radio-flip-key="control-previous" onClick={transportPrevious} disabled={!canPlay} aria-keyshortcuts="P" aria-label="Faixa anterior"><Icon name="previous" /></button>
        <button
          type="button"
          className={styles.playButton}
          data-radio-flip-key="control-play"
          onClick={radio.toggle}
          disabled={!canPlay}
          data-playback-state={radio.status}
          aria-busy={pending}
          aria-keyshortcuts="Space K"
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <Icon name={playing || pending ? "pause" : "play"} />
        </button>
        <button type="button" data-radio-flip-key="control-next" onClick={transportNext} disabled={!canPlay || !radio.canSkipNext} aria-keyshortcuts="N" aria-label="Próxima faixa"><Icon name="next" /></button>
        <div
          ref={volumeMenuRef}
          className={styles.volumeMenu}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setVolumeOpen(false);
          }}
        >
          <button
            ref={volumeButtonRef}
            type="button"
            className={`${styles.modeButton} ${styles.volumeTrigger}`}
            data-radio-flip-key="control-volume"
            onClick={() => setVolumeOpen((open) => !open)}
            disabled={!canPlay}
            aria-label={`Volume ${Math.round(radio.volume * 100)}%. ${volumeOpen ? "Fechar" : "Abrir"} controle`}
            aria-expanded={volumeOpen}
            aria-controls={volumeOpen ? volumePanelId : undefined}
          >
            <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
          </button>
          {volumeOpen ? (
            <div id={volumePanelId} className={styles.volumePopover} role="group" aria-label="Controle de volume">
              <button type="button" className={styles.muteButton} onClick={radio.toggleMute} aria-label={radio.volume === 0 ? "Ativar som" : "Silenciar"} title={radio.volume === 0 ? "Ativar som" : "Silenciar"}>
                <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
              </button>
              <input
                className={styles.volumeSlider}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={radio.volume}
                onChange={(event) => radio.setVolume(Number(event.target.value))}
                aria-label="Volume"
                aria-valuetext={`${Math.round(radio.volume * 100)}%`}
                style={{ "--volume-level": `${Math.round(radio.volume * 100)}%` } as CSSProperties}
              />
              <span className={styles.volumeLevel}>{Math.round(radio.volume * 100)}%</span>
            </div>
          ) : null}
        </div>
        <button type="button" className={styles.modeButton} data-radio-flip-key="control-favorite" disabled aria-label="Favoritos indisponíveis nesta prévia" title="Favoritos em breve"><Icon name="heart" /></button>
      </div>

      <RadioVisualizer className={styles.visualizer} motionKey="visualizer" active={visualizerActive} />

      <div className={styles.queueHeader} data-radio-motion-key="queue-header">
        <h3>Playlist</h3>
        {(!mobile || mobilePanel === "playlist") ? (
          <label className={styles.searchField}>
            <span className={styles.srOnly}>Buscar na playlist</span>
            <Icon name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar na playlist..."
            />
          </label>
        ) : null}
        {mobile ? (
          <button type="button" className={styles.panelToggle} onClick={() => setMobilePanel((panel) => panel === "playlist" ? "lyrics" : "playlist")} aria-label={mobilePanel === "playlist" ? "Expandir letra" : "Expandir playlist"}>
            {mobilePanel === "playlist" ? "Letra ↓" : "↑"}
          </button>
        ) : null}
      </div>

      <ol
        ref={trackListRef}
        className={styles.trackList}
        aria-label="Músicas da playlist"
        data-radio-motion-key="queue-list"
      >
        {listTracks.map(({ track, position }) => (
          <li key={track.id} data-track-id={track.id}>
            <button
              type="button"
              className={styles.trackRow}
              aria-current={track.id === radio.currentTrack?.id ? "true" : undefined}
              onClick={() => selectTrackWithMotion(track.id)}
              data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
            >
              <span
                className={styles.trackThumb}
                data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
              ><Image src={track.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="48px" unoptimized /></span>
              <span
                className={styles.trackMeta}
                data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
              ><strong>{track.title}</strong><small>{track.artist}</small></span>
              <span className={styles.trackState}>{String(position).padStart(2, "0")}</span>
              <span className={styles.duration}>{formatTrackDuration(track.durationSeconds ?? (track.id === radio.currentTrack?.id ? radio.duration : undefined))}</span>
            </button>
          </li>
        ))}
        {listTracks.length === 0 ? (
          <li className={styles.emptyState}>{normalizedQuery ? "Nenhuma música encontrada." : "A playlist está vazia."}</li>
        ) : null}
      </ol>
      {mobile || expanded ? (
        <RadioLyrics
          trackId={radio.currentTrack?.id}
          title={radio.currentTrack?.title}
          headingId={mobile ? "mobile-radio-lyrics-title" : "radio-lyrics-title"}
          active={!mobile || mobilePanel === "lyrics"}
          onClose={mobile ? () => setMobilePanel("playlist") : undefined}
        />
      ) : null}
      {radio.error ? <p className={styles.playerMessage} role="alert">{radio.error} <button type="button" onClick={radio.retry}>Tentar novamente</button></p> : null}
      {!radio.error && radio.currentTrack?.fixture ? <p className={styles.playerMessage}>Áudio sintético para teste local. Nenhuma música foi publicada.</p> : null}
    </div>
  );
}

export function StudioRadioShell({ children }: { children?: ReactNode }) {
  const radio = useRadio();
  const reduceStudioMotion = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const studioRoute = pathname.startsWith("/studio") ? "detail" : "home";
  const studioHub = pathname === "/studio";
  const studioNestedRoute = studioRoute === "detail" && !studioHub;
  const shellRef = useRef<HTMLDivElement>(null);
  const radioNavRef = useRef<HTMLAnchorElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const dockMiniRef = useRef<HTMLDivElement>(null);
  const dockFlightRef = useRef<HTMLDivElement>(null);
  const dockAnimationRef = useRef<Animation | null>(null);
  const dockNavAnimationRef = useRef<Animation | null>(null);
  const dockFlightFrameRef = useRef<number | null>(null);
  const dockMotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockMotionTokenRef = useRef(0);
  const dockedRef = useRef(false);
  const dockRestoreWidthRef = useRef(DEFAULT_RADIO_WIDTH);
  const dockRestoreModeRef = useRef<RadioLayoutMode>("split");
  const dockEdgeDragRef = useRef<{ pointerId: number; startX: number } | null>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const customWidthRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragPointerVelocityRef = useRef(0);
  const dragStartDistanceRef = useRef(0);
  const dragOriginRef = useRef<"sidebar" | "fullscreen">("sidebar");
  const initialRadioWidthRef = useRef(DEFAULT_RADIO_WIDTH);
  const initialRadioLayoutModeRef = useRef<RadioLayoutMode>("split");
  const pointerActiveRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const dragFullscreenRef = useRef(false);
  const dragRestoredRef = useRef(false);
  const returnDistanceRef = useRef(0);
  const returnOffsetRef = useRef(0);
  const openedFromDragRef = useRef(false);
  const previewResetFrameRef = useRef<number | null>(null);
  const motionResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRadioAnimationsRef = useRef<Animation[]>([]);
  const radioMotionTokenRef = useRef(0);
  const signatureStageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dividerSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [radioWidth, setRadioWidth] = useState<number | null>(null);
  const [shellWidth, setShellWidth] = useState<number | null>(null);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const [radioExpanded, setRadioExpanded] = useState(false);
  const [showResizeHint, setShowResizeHint] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [radioFullscreen, setRadioFullscreen] = useState(false);
  const [radioDocked, setRadioDocked] = useState(false);
  const [radioDockMotion, setRadioDockMotion] = useState<"docking" | "restoring" | null>(null);
  const [layoutMotionDirection, setLayoutMotionDirection] = useState<"opening" | "closing" | null>(null);
  const [dividerSettling, setDividerSettling] = useState(false);
  const [mobileRadioOpen, setMobileRadioOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniVolumeOpen, setMiniVolumeOpen] = useState(false);
  const [mobileRadioMotion, setMobileRadioMotion] = useState<MobileRadioMotionState | null>(null);
  const [trackStepMotion, setTrackStepMotion] = useState<TrackStepMotionState | null>(null);
  const [studioRouteMotion, setStudioRouteMotion] = useState<StudioRouteMotion>(null);
  const [studioIntroCycle, setStudioIntroCycle] = useState(0);
  const miniVolumeMenuRef = useRef<HTMLDivElement>(null);
  const miniVolumeButtonRef = useRef<HTMLButtonElement>(null);
  const miniOpenButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMotionActiveRef = useRef(false);
  const mobileMotionTokenRef = useRef(0);
  const trackStepMotionTokenRef = useRef(0);
  const routeTransitionActiveRef = useRef(false);
  const routeMotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shellStyle = useMemo(
    () =>
      (radioWidth === null
        ? {}
        : { "--radio-width": `${radioWidth}px` }) as CSSProperties,
    [radioWidth]
  );

  const radioLayoutMode = useMemo(
    () =>
      resolveRadioLayoutMode({
        fullscreen: radioFullscreen,
        docked: radioDocked,
        expanded: radioExpanded,
        width: radioWidth,
        defaultWidth: shellWidth === null ? null : getDefaultWidth(shellWidth)
      }),
    [radioDocked, radioExpanded, radioFullscreen, radioWidth, shellWidth]
  );

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/studio");
  }, [router]);

  useEffect(() => {
    if (studioRoute !== "home") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setStudioIntroCycle((cycle) => cycle + 1);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [studioRoute]);

  useEffect(() => () => {
    if (routeMotionTimerRef.current !== null) {
      clearTimeout(routeMotionTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) {
      return;
    }

    if (mobileRadioOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!mobileRadioOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileRadioOpen]);

  useEffect(() => {
    if (!miniVolumeOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!miniVolumeMenuRef.current?.contains(event.target as Node)) setMiniVolumeOpen(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMiniVolumeOpen(false);
      miniVolumeButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [miniVolumeOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 73.74rem)");
    function leaveDesktop() {
      if (media.matches) {
        cancelDockFlight();
        dockedRef.current = false;
        setRadioDocked(false);
        setRadioDockMotion(null);
        setRadioFullscreen(false);
        setRadioExpanded(false);
      }
    }
    media.addEventListener("change", leaveDesktop);
    return () => media.removeEventListener("change", leaveDesktop);
  }, []);

  useEffect(() => () => {
    radioMotionTokenRef.current += 1;
    if (motionResetTimerRef.current !== null) clearTimeout(motionResetTimerRef.current);
    if (signatureStageTimerRef.current !== null) clearTimeout(signatureStageTimerRef.current);
    for (const animation of activeRadioAnimationsRef.current) animation.cancel();
    activeRadioAnimationsRef.current = [];
    if (dividerSettleTimerRef.current !== null) clearTimeout(dividerSettleTimerRef.current);
    cancelDockFlight();
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = shell.getBoundingClientRect().width;
      setShellWidth(width);
      setDesktopLayout(window.matchMedia("(min-width: 73.75rem)").matches);
      setRadioWidth((current) =>
        dockedRef.current
          ? current
          : radioExpanded
          ? getExpandedWidth(width)
          : customWidthRef.current
            ? clampRadioWidth(width, current ?? getDefaultWidth(width))
            : getDefaultWidth(width)
      );
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [radioExpanded]);

  function updateRadioWidth(requested: number) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const next = clampRadioWidth(shell.getBoundingClientRect().width, requested);
    setRadioWidth(next);
  }

  function toggleRadioExpanded() {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const shellWidth = shell.getBoundingClientRect().width;
    customWidthRef.current = false;

    if (radioExpanded) {
      runRadioMotion("closing", () => {
        setRadioWidth(getDefaultWidth(shellWidth));
        setRadioExpanded(false);
        setShowResizeHint(false);
      });
      return;
    }

    runRadioMotion("opening", () => {
      setRadioWidth(getExpandedWidth(shellWidth));
      setRadioExpanded(true);
      setShowResizeHint(true);
    });
  }

  function clearDragPreview() {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.removeProperty("--radio-preview-width");
    delete shell.dataset.radioPreview;
  }

  function setDividerMagnet(snap: RadioSnapKind | null) {
    const shell = shellRef.current;
    if (!shell) return;
    if (snap) shell.dataset.radioMagnet = snap;
    else delete shell.dataset.radioMagnet;
  }

  function settleDivider(targetWidth: number, snap: RadioSnapKind | null) {
    if (!snap) return;

    const nextFocused = snap === "focus";
    const applySettle = () => {
      if (dividerSettleTimerRef.current !== null) {
        clearTimeout(dividerSettleTimerRef.current);
      }

      setDividerSettling(true);
      customWidthRef.current = snap === "compact";
      setRadioExpanded(nextFocused);
      setRadioWidth(targetWidth);

      dividerSettleTimerRef.current = setTimeout(() => {
        setDividerSettling(false);
        dividerSettleTimerRef.current = null;
      }, 460);
    };

    if (nextFocused !== radioExpanded) {
      runRadioMotion(nextFocused ? "opening" : "closing", applySettle);
      return;
    }

    applySettle();
  }

  function clearReturnPreview() {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.removeProperty("--radio-return-offset");
    delete shell.dataset.radioReturning;
    returnOffsetRef.current = 0;
  }

  function runTrackStepMotion(kind: TrackStepKind, action: () => void) {
    if (mobileMotionActiveRef.current) {
      action();
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;
    if (reduce || !documentWithTransition.startViewTransition) {
      action();
      return;
    }

    const token = ++trackStepMotionTokenRef.current;
    let updated = false;

    flushSync(() => {
      setTrackStepMotion({ kind, phase: "source" });
    });

    try {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          updated = true;
          action();
          setTrackStepMotion({ kind, phase: "destination" });
        });
      });

      void transition.finished.finally(() => {
        if (trackStepMotionTokenRef.current === token) {
          setTrackStepMotion(null);
        }
      });
    } catch {
      if (trackStepMotionTokenRef.current === token) {
        setTrackStepMotion(null);
      }
      if (!updated) action();
    }
  }

  function previousTrack() {
    if (radio.position > 3 || !radio.hasPrevious) {
      radio.previous();
      return;
    }
    runTrackStepMotion("previous", radio.previous);
  }

  function nextTrack() {
    runTrackStepMotion("next", radio.next);
  }

  const handleRadioShortcut = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (shouldIgnoreRadioShortcutTarget(event.target)) return;

    const command = resolveRadioKeyboardCommand(event);
    if (!command || !radio.currentTrack) return;
    if (command.type === "next" && !radio.canSkipNext) return;

    event.preventDefault();

    switch (command.type) {
      case "toggle":
        radio.toggle();
        break;
      case "seek":
        radio.seek(radio.position + command.seconds);
        break;
      case "mute":
        radio.toggleMute();
        break;
      case "previous":
        previousTrack();
        break;
      case "next":
        nextTrack();
        break;
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleRadioShortcut);
    return () => window.removeEventListener("keydown", handleRadioShortcut);
  }, []);

  function runMobileRadioMotion(direction: "opening" | "closing") {
    if (mobileMotionActiveRef.current) return;

    const open = direction === "opening";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;

    setMiniVolumeOpen(false);

    if (reduce || !documentWithTransition.startViewTransition) {
      setMobileRadioMotion(null);
      setMobileRadioOpen(open);
      if (!open) {
        requestAnimationFrame(() => miniOpenButtonRef.current?.focus());
      }
      return;
    }

    mobileMotionActiveRef.current = true;
    const token = ++mobileMotionTokenRef.current;

    flushSync(() => {
      setMobileRadioMotion({ direction, phase: "source" });
    });

    try {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          setMobileRadioOpen(open);
          setMobileRadioMotion({ direction, phase: "destination" });
        });

        const dialog = mobileDialogRef.current;
        if (open && dialog && !dialog.open) {
          dialog.showModal();
        } else if (!open && dialog?.open) {
          dialog.close();
        }
      });

      void transition.finished.finally(() => {
        if (mobileMotionTokenRef.current !== token) return;
        mobileMotionActiveRef.current = false;
        setMobileRadioMotion(null);
        if (!open) {
          requestAnimationFrame(() => miniOpenButtonRef.current?.focus());
        }
      });
    } catch {
      mobileMotionActiveRef.current = false;
      setMobileRadioMotion(null);
      setMobileRadioOpen(open);
    }
  }

  function openMobileRadio() {
    runMobileRadioMotion("opening");
  }

  function closeMobileRadio() {
    runMobileRadioMotion("closing");
  }

  function clearSignatureStageTimer() {
    if (signatureStageTimerRef.current !== null) {
      clearTimeout(signatureStageTimerRef.current);
      signatureStageTimerRef.current = null;
    }
  }

  function cancelRadioMotionForDirectManipulation() {
    radioMotionTokenRef.current += 1;
    clearSignatureStageTimer();
    if (motionResetTimerRef.current !== null) {
      clearTimeout(motionResetTimerRef.current);
      motionResetTimerRef.current = null;
    }
    for (const animation of activeRadioAnimationsRef.current) {
      animation.cancel();
    }
    activeRadioAnimationsRef.current = [];
    setLayoutMotionDirection(null);
  }

  function runRadioMotion(direction: "opening" | "closing", update: () => void) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const token = ++radioMotionTokenRef.current;

    if (motionResetTimerRef.current !== null) {
      clearTimeout(motionResetTimerRef.current);
      motionResetTimerRef.current = null;
    }

    const panel = shellRef.current?.querySelector<HTMLElement>("#radio");
    // Measure before cancelling the previous WAAPI set so an interruption starts
    // from the geometry the user is actually seeing in this frame.
    const before = !reduce && panel ? collectRadioFlipSnapshot(panel) : null;

    for (const animation of activeRadioAnimationsRef.current) {
      animation.cancel();
    }
    activeRadioAnimationsRef.current = [];

    const clearMotionState = () => {
      if (radioMotionTokenRef.current !== token) return;
      setLayoutMotionDirection(null);
      motionResetTimerRef.current = null;
      activeRadioAnimationsRef.current = [];
    };

    flushSync(() => {
      setLayoutMotionDirection(reduce ? null : direction);
      update();
    });

    if (reduce || !panel || !before) {
      clearMotionState();
      return;
    }

    const animations = animateRadioFlip(panel, before, direction);
    activeRadioAnimationsRef.current = animations;
    const totalDuration = direction === "opening" ? 900 : 760;

    if (animations.length === 0) {
      motionResetTimerRef.current = setTimeout(clearMotionState, totalDuration);
      return;
    }

    void Promise.allSettled(animations.map((animation) => animation.finished)).finally(
      clearMotionState
    );
    motionResetTimerRef.current = setTimeout(clearMotionState, totalDuration + 80);
  }

  function cancelDockFlight() {
    ++dockMotionTokenRef.current;
    if (dockFlightFrameRef.current !== null) {
      cancelAnimationFrame(dockFlightFrameRef.current);
      dockFlightFrameRef.current = null;
    }
    if (dockMotionTimerRef.current !== null) {
      clearTimeout(dockMotionTimerRef.current);
      dockMotionTimerRef.current = null;
    }
    dockAnimationRef.current?.cancel();
    dockNavAnimationRef.current?.cancel();
    dockAnimationRef.current = null;
    dockNavAnimationRef.current = null;
    if (dockFlightRef.current) {
      dockFlightRef.current.style.display = "none";
      dockFlightRef.current.style.visibility = "hidden";
    }
  }

  /** The only owner of the sidebar-to-navbar transformation.
   * Measure the existing surface before updating React, then fly a single
   * artwork surface to its target while the real Studio and header reflow.
   * React never remounts the player provider or fabricates audio.
   */
  function runRadioDockTransition(nextDocked: boolean, restoreWidth?: number, restoreMode?: RadioLayoutMode, fromFullscreen = false) {
    const shell = shellRef.current;
    const mini = dockMiniRef.current;
    const flight = dockFlightRef.current;
    const panel = shell?.querySelector<HTMLElement>("#radio");
    if (!shell || !mini || !flight || !panel) return;
    if (!window.matchMedia("(min-width: 73.75rem)").matches) return;
    if (radioFullscreen && !fromFullscreen) return;
    if (dockedRef.current === nextDocked && dockAnimationRef.current === null) return;

    const header = shell.closest(`.${styles.site}`)?.querySelector<HTMLElement>(`.${styles.siteHeader}`);
    const nav = header?.querySelector<HTMLElement>(`.${styles.desktopNav}`);
    const navFrom = nav?.getBoundingClientRect() ?? null;
    const currentlyFlying = flight.style.display === "block" && dockAnimationRef.current !== null;
    const from = currentlyFlying
      ? flight.getBoundingClientRect()
      : (nextDocked ? panel : mini).getBoundingClientRect();

    if (nextDocked && !dockedRef.current) {
      dockRestoreWidthRef.current = restoreWidth ?? radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width);
      dockRestoreModeRef.current = restoreMode && restoreMode !== "docked" && restoreMode !== "fullscreen"
        ? restoreMode
        : radioLayoutMode === "docked" || radioLayoutMode === "fullscreen" ? "split" : radioLayoutMode;
    }

    cancelDockFlight();
    const token = dockMotionTokenRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dockedRef.current = nextDocked;

    flushSync(() => {
      setRadioDocked(nextDocked);
      setRadioDockMotion(reduce ? null : nextDocked ? "docking" : "restoring");
      if (nextDocked) {
        setRadioFullscreen(false);
        setRadioExpanded(false);
        setShowResizeHint(false);
      } else {
        const width = clampRadioWidth(shell.getBoundingClientRect().width, dockRestoreWidthRef.current);
        customWidthRef.current = dockRestoreModeRef.current === "custom";
        setRadioWidth(width);
        setRadioExpanded(dockRestoreModeRef.current === "focus");
      }
    });

    if (reduce) {
      if (!nextDocked) requestAnimationFrame(() => resizeHandleRef.current?.focus());
      return;
    }

    const complete = () => {
      if (dockMotionTokenRef.current !== token) return;
      if (dockMotionTimerRef.current !== null) {
        clearTimeout(dockMotionTimerRef.current);
        dockMotionTimerRef.current = null;
      }
      dockAnimationRef.current?.cancel();
      dockNavAnimationRef.current?.cancel();
      dockAnimationRef.current = null;
      dockNavAnimationRef.current = null;
      flight.style.display = "none";
      flight.style.visibility = "hidden";
      setRadioDockMotion(null);
      if (!nextDocked) requestAnimationFrame(() => resizeHandleRef.current?.focus());
    };

    // Two frames allow a CSS grid transition to establish the destination
    // without reading an outdated dock position from the previous layout.
    dockFlightFrameRef.current = requestAnimationFrame(() => {
      dockFlightFrameRef.current = requestAnimationFrame(() => {
        dockFlightFrameRef.current = null;
        if (dockMotionTokenRef.current !== token) return;
        const destination = (nextDocked ? mini : panel).getBoundingClientRect();
        if (!destination.width || !destination.height || !from.width || !from.height) {
          complete();
          return;
        }

        if (nav && navFrom) {
          const navTo = nav.getBoundingClientRect();
          const dx = navFrom.left - navTo.left;
          if (Math.abs(dx) > 1) {
            const navAnimation = nav.animate(
              [{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }],
              { duration: RADIO_DOCK_FLIGHT_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
            );
            dockNavAnimationRef.current = navAnimation;
            void navAnimation.finished.catch(() => undefined);
          }
        }

        const rightRemaining = nextDocked && header
          ? Math.max(0, window.innerWidth - header.getBoundingClientRect().right)
          : 0;
        flight.style.display = "block";
        flight.style.visibility = "visible";
        const animation = flight.animate([
          {
            left: `${from.left}px`,
            top: `${from.top}px`,
            width: `${from.width}px`,
            height: `${from.height}px`,
            borderRadius: nextDocked ? "0px" : "12px",
            opacity: 0.98
          },
          {
            left: `${destination.left + rightRemaining}px`,
            top: `${destination.top}px`,
            width: `${destination.width}px`,
            height: `${destination.height}px`,
            borderRadius: nextDocked ? "12px" : "0px",
            opacity: 0.96
          }
        ], {
          duration: RADIO_DOCK_FLIGHT_MS,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards"
        });
        dockAnimationRef.current = animation;
        void animation.finished.then(complete).catch(() => undefined);
        dockMotionTimerRef.current = setTimeout(complete, RADIO_DOCK_FLIGHT_MS + 150);
      });
    });
  }

  function openRadioFullscreen(fromDrag: boolean) {
    if (!fromDrag && (radioFullscreen || signatureStageTimerRef.current !== null)) {
      return;
    }

    const shell = shellRef.current;
    const shellWidth = shell?.getBoundingClientRect().width;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wasDocked = dockedRef.current;

    clearSignatureStageTimer();
    if (wasDocked) {
      cancelDockFlight();
      dockedRef.current = false;
    }

    if (!fromDrag) {
      initialRadioWidthRef.current = wasDocked
        ? dockRestoreWidthRef.current
        : radioWidth ?? (shellWidth ? getDefaultWidth(shellWidth) : DEFAULT_RADIO_WIDTH);
      initialRadioLayoutModeRef.current = wasDocked ? "docked" : radioLayoutMode;
    }

    openedFromDragRef.current = fromDrag;
    dragFullscreenRef.current = true;

    const enterFullscreen = () => {
      signatureStageTimerRef.current = null;
      runRadioMotion("opening", () => {
        clearDragPreview();
        setShowResizeHint(false);
        setRadioDocked(false);
        setRadioDockMotion(null);
        setRadioFullscreen(true);
      });
    };

    if (
      !reduce &&
      !fromDrag &&
      !radioExpanded &&
      !radioFullscreen &&
      !wasDocked &&
      shellWidth
    ) {
      customWidthRef.current = false;
      runRadioMotion("opening", () => {
        setRadioWidth(getExpandedWidth(shellWidth));
        setRadioExpanded(true);
        setShowResizeHint(false);
      });

      signatureStageTimerRef.current = setTimeout(enterFullscreen, 190);
      return;
    }

    enterFullscreen();
  }

  function restoreMediumFromPocket() {
    const shell = shellRef.current;
    if (!shell || !dockedRef.current) return;
    dockRestoreWidthRef.current = getDefaultWidth(shell.getBoundingClientRect().width);
    dockRestoreModeRef.current = "split";
    runRadioDockTransition(false);
  }

  function dockRadio() {
    if (radioFullscreen) {
      const shell = shellRef.current;
      const width = shell ? getDefaultWidth(shell.getBoundingClientRect().width) : DEFAULT_RADIO_WIDTH;
      runRadioDockTransition(true, width, "split", true);
      return;
    }
    runRadioDockTransition(true);
  }

  function showMediumRadio() {
    const shell = shellRef.current;
    if (!shell) return;
    clearSignatureStageTimer();
    const width = getDefaultWidth(shell.getBoundingClientRect().width);
    runRadioMotion("closing", () => {
      clearDragPreview();
      clearReturnPreview();
      dragFullscreenRef.current = false;
      openedFromDragRef.current = false;
      customWidthRef.current = false;
      dockedRef.current = false;
      initialRadioWidthRef.current = width;
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(width);
      setRadioDocked(false);
      setRadioDockMotion(null);
      setRadioExpanded(false);
      setRadioFullscreen(false);
    });
  }

  function closeRadioFullscreen(restoreFocus = true) {
    clearSignatureStageTimer();
    const returnMode = initialRadioLayoutModeRef.current;
    runRadioMotion("closing", () => {
      clearDragPreview();
      dragFullscreenRef.current = false;
      customWidthRef.current = returnMode === "custom" || (returnMode === "docked" && dockRestoreModeRef.current === "custom");
      dockedRef.current = returnMode === "docked";
      setRadioWidth(initialRadioWidthRef.current);
      setRadioDocked(returnMode === "docked");
      setRadioDockMotion(null);
      setRadioExpanded(returnMode === "focus");
      setRadioFullscreen(false);
      clearReturnPreview();
    });
    if (restoreFocus) {
      requestAnimationFrame(() => {
        (returnMode === "docked"
          ? dockMiniRef.current?.querySelector<HTMLButtonElement>('[data-dock-restore="true"]')
          : openedFromDragRef.current ? resizeHandleRef.current : radioNavRef.current)?.focus();
      });
    }
  }

  function restoreInitialRadioLayout() {
    // Navigation within the Studio does not unexpectedly reopen the sidebar.
    if (dockedRef.current && !radioFullscreen) return;
    if (radioFullscreen && initialRadioLayoutModeRef.current === "docked") {
      closeRadioFullscreen(false);
      return;
    }
    clearSignatureStageTimer();
    const shellWidth = shellRef.current?.getBoundingClientRect().width;
    const initialWidth = shellWidth ? getDefaultWidth(shellWidth) : DEFAULT_RADIO_WIDTH;

    if (
      !radioFullscreen &&
      !radioExpanded &&
      !customWidthRef.current &&
      (radioWidth === null || radioWidth === initialWidth)
    ) {
      return;
    }

    runRadioMotion("closing", () => {
      clearDragPreview();
      clearReturnPreview();
      dragFullscreenRef.current = false;
      openedFromDragRef.current = false;
      customWidthRef.current = false;
      initialRadioWidthRef.current = initialWidth;
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(initialWidth);
      setRadioExpanded(false);
      setRadioFullscreen(false);
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerActiveRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (previewResetFrameRef.current !== null) cancelAnimationFrame(previewResetFrameRef.current);
    previewResetFrameRef.current = null;
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    cancelRadioMotionForDirectManipulation();

    const rect = shell.getBoundingClientRect();
    dragOriginRef.current = radioFullscreen ? "fullscreen" : "sidebar";
    if (!radioFullscreen) {
      initialRadioWidthRef.current = radioWidth ?? getDefaultWidth(rect.width);
      initialRadioLayoutModeRef.current = radioLayoutMode;
    }
    dragFullscreenRef.current = radioFullscreen;
    dragRestoredRef.current = false;
    dragOffsetRef.current = rect.right - event.clientX - initialRadioWidthRef.current;
    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;
    dragPointerVelocityRef.current = 0;
    dragStartDistanceRef.current = event.clientX - rect.left;
    returnDistanceRef.current = Math.max(0, rect.width - initialRadioWidthRef.current - event.currentTarget.getBoundingClientRect().width);
    pointerActiveRef.current = true;
    pointerMovedRef.current = false;
    setShowResizeHint(!radioFullscreen);
    clearDragPreview();
    clearReturnPreview();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerActiveRef.current || Math.abs(event.clientX - dragStartXRef.current) < 4) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    pointerMovedRef.current = true;

    const elapsed = Math.max(8, event.timeStamp - dragLastTimeRef.current);
    const instantPointerVelocity = (event.clientX - dragLastXRef.current) / elapsed;
    dragPointerVelocityRef.current =
      dragPointerVelocityRef.current * 0.56 + instantPointerVelocity * 0.44;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;

    if (dragOriginRef.current === "fullscreen") {
      const distance = Math.min(returnDistanceRef.current, Math.max(0, event.clientX - dragStartXRef.current));
      returnOffsetRef.current = distance;
      if (distance > 0) {
        shell.style.setProperty("--radio-return-offset", `${distance}px`);
        shell.dataset.radioReturning = "true";
      } else {
        clearReturnPreview();
      }
      if (distance >= returnDistanceRef.current) {
        pointerActiveRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
        closeRadioFullscreen(false);
      }
      return;
    }

    const requested = rect.right - event.clientX - dragOffsetRef.current;
    const dockIntent = getRadioDockIntent(requested, MIN_RADIO_WIDTH);
    if (dockIntent.ready) shell.dataset.radioDockReady = "true";
    else delete shell.dataset.radioDockReady;
    const maximum = clampRadioWidth(rect.width, Number.POSITIVE_INFINITY);
    const pointerDistance = event.clientX - rect.left;
    const preview = getRadioDragPreview(rect.width, maximum, requested, pointerDistance, dragStartDistanceRef.current);

    if (dragFullscreenRef.current) {
      if (pointerDistance > dragStartDistanceRef.current / 2 + 48) {
        dragRestoredRef.current = true;
        closeRadioFullscreen(false);
      }
      return;
    }

    if (dragRestoredRef.current) {
      if (preview.ready) {
        dragRestoredRef.current = false;
        openRadioFullscreen(true);
      }
      return;
    }

    const clampedRequested = clampRadioWidth(rect.width, requested);
    const snapPoints = createRadioSnapPoints(
      MIN_RADIO_WIDTH,
      getDefaultWidth(rect.width),
      getExpandedWidth(rect.width)
    );
    const magnet = getRadioDragMagnet(clampedRequested, snapPoints);

    customWidthRef.current = true;
    updateRadioWidth(magnet.width);
    setDividerMagnet(magnet.snap);
    setRadioExpanded(false);
    if (preview.ready) {
      openRadioFullscreen(true);
      return;
    }
    if (preview.width > 0) {
      shell.style.setProperty("--radio-preview-width", `${preview.width}px`);
      shell.dataset.radioPreview = "true";
    } else {
      clearDragPreview();
    }
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!pointerActiveRef.current) return;
    const shouldRestore = event.type === "pointercancel" && dragOriginRef.current === "sidebar" && dragFullscreenRef.current;
    const shouldReturn = event.type === "pointerup" && dragOriginRef.current === "fullscreen" && returnOffsetRef.current >= returnDistanceRef.current / 2;
    const shouldSettle =
      event.type === "pointerup" &&
      pointerMovedRef.current &&
      dragOriginRef.current === "sidebar" &&
      !dragFullscreenRef.current &&
      !dragRestoredRef.current;
    const shellAtRelease = shellRef.current;
    const requestedAtRelease = shellAtRelease
      ? shellAtRelease.getBoundingClientRect().right - event.clientX - dragOffsetRef.current
      : MIN_RADIO_WIDTH;
    const shouldDock = shouldSettle && getRadioDockIntent(requestedAtRelease, MIN_RADIO_WIDTH).ready;

    pointerActiveRef.current = false;
    setDragging(false);
    setShowResizeHint(false);

    if (shouldRestore || shouldReturn) {
      closeRadioFullscreen(false);
    } else if (shouldDock) {
      runRadioDockTransition(true, initialRadioWidthRef.current, initialRadioLayoutModeRef.current);
    } else if (event.type === "pointercancel" && dragOriginRef.current === "sidebar" && !dragFullscreenRef.current) {
      // A cancelled pointer is not an implicit dock, nor a committed resize.
      customWidthRef.current = initialRadioLayoutModeRef.current === "custom";
      setRadioWidth(initialRadioWidthRef.current);
      setRadioExpanded(initialRadioLayoutModeRef.current === "focus");
    } else if (shouldSettle) {
      const shell = shellRef.current;
      if (shell) {
        const rect = shell.getBoundingClientRect();
        const releasedWidth = clampRadioWidth(
          rect.width,
          rect.right - event.clientX - dragOffsetRef.current
        );
        const snapPoints = createRadioSnapPoints(
          MIN_RADIO_WIDTH,
          getDefaultWidth(rect.width),
          getExpandedWidth(rect.width)
        );
        const target = getRadioReleaseTarget(
          releasedWidth,
          -dragPointerVelocityRef.current,
          snapPoints
        );
        settleDivider(target.width, target.snap);
      }
    }

    setDividerMagnet(null);
    if (shellAtRelease) delete shellAtRelease.dataset.radioDockReady;
    previewResetFrameRef.current = requestAnimationFrame(() => {
      clearDragPreview();
      clearReturnPreview();
      previewResetFrameRef.current = null;
    });
  }

  function handleResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (radioFullscreen) {
      if (["Enter", " ", "Escape", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        closeRadioFullscreen();
      }
      return;
    }
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const step = event.shiftKey ? 48 : 16;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleRadioExpanded();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth((radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width)) + step);
      setRadioExpanded(false);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const width = radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width);
      if (width <= MIN_RADIO_WIDTH + 1) {
        runRadioDockTransition(true, width, radioLayoutMode);
      } else {
        customWidthRef.current = true;
        updateRadioWidth(width - step);
        setRadioExpanded(false);
      }
    }

    if (event.key === "Home") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth(MIN_RADIO_WIDTH);
      setRadioExpanded(false);
    }

    if (event.key === "End") {
      event.preventDefault();
      customWidthRef.current = false;
      const shellWidth = shell.getBoundingClientRect().width;
      runRadioMotion("opening", () => {
        setRadioWidth(getExpandedWidth(shellWidth));
        setRadioExpanded(true);
      });
    }
  }

  function navigateStudioRoute(href: "/" | "/studio") {
    restoreInitialRadioLayout();
    if (pathname === href || routeTransitionActiveRef.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      router.push(href);
      return;
    }

    if (routeMotionTimerRef.current !== null) {
      clearTimeout(routeMotionTimerRef.current);
      routeMotionTimerRef.current = null;
    }

    const direction: StudioRouteMotion = href === "/studio" ? "entering" : "exiting";
    routeTransitionActiveRef.current = true;

    flushSync(() => {
      setStudioRouteMotion(direction);
    });

    requestAnimationFrame(() => {
      router.push(href);
    });

    routeMotionTimerRef.current = setTimeout(() => {
      setStudioRouteMotion(null);
      routeTransitionActiveRef.current = false;
      routeMotionTimerRef.current = null;
    }, 1280);
  }

  function handleStudioRouteLink(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: "/" | "/studio"
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateStudioRoute(href);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const miniMotionEndpoint = Boolean(
    mobileRadioMotion &&
      (
        (mobileRadioMotion.direction === "opening" && mobileRadioMotion.phase === "source") ||
        (mobileRadioMotion.direction === "closing" && mobileRadioMotion.phase === "destination")
      )
  );
  const dialogMotionEndpoint = Boolean(
    mobileRadioMotion &&
      (
        (mobileRadioMotion.direction === "opening" && mobileRadioMotion.phase === "destination") ||
        (mobileRadioMotion.direction === "closing" && mobileRadioMotion.phase === "source")
      )
  );

  const radioAtMaximumWidth =
    desktopLayout &&
    shellWidth !== null &&
    radioWidth !== null &&
    radioWidth >= clampRadioWidth(shellWidth, Number.POSITIVE_INFINITY) - 1;

  const activeNav =
    radioFullscreen || radioExpanded || mobileRadioOpen || radioAtMaximumWidth
      ? "radio"
      : studioRoute === "detail"
        ? "studio"
        : "home";

  const playbackStatusMessage =
    radio.status === "loading"
      ? "Carregando áudio."
      : radio.status === "buffering"
        ? "Aguardando dados de áudio."
        : radio.status === "playing"
          ? "Reprodução iniciada."
          : radio.status === "paused"
            ? "Reprodução pausada."
            : "";

  return (
    <div id="top" className={styles.site} style={shellStyle} data-radio-layout-mode={radioLayoutMode} data-radio-docked={radioDocked ? "true" : undefined} data-radio-dock-motion={radioDockMotion ?? undefined} data-radio-expanded={radioExpanded ? "true" : undefined} data-radio-wider-than-default={shellWidth !== null && radioWidth !== null && radioWidth > getDefaultWidth(shellWidth) ? "true" : undefined} data-radio-dragging={dragging ? "true" : undefined} data-radio-fullscreen={radioFullscreen ? "true" : undefined} data-radio-layout-motion={layoutMotionDirection ?? undefined} data-radio-divider-settling={dividerSettling ? "true" : undefined}>
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {playbackStatusMessage}
      </span>
      <header className={styles.siteHeader}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="CM 3D e Rádio, início"
          onClick={(event) => handleStudioRouteLink(event, "/")}
        >
          <Image src="/images/cm-3d-radio-logo.png" alt="" width={1983} height={793} priority unoptimized />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <Link
            href="/"
            aria-current={activeNav === "home" ? "page" : undefined}
            onClick={(event) => handleStudioRouteLink(event, "/")}
          >
            Início
          </Link>
          <Link
            href="/studio"
            aria-current={activeNav === "studio" ? "page" : undefined}
            onPointerEnter={() => router.prefetch("/studio")}
            onClick={(event) => handleStudioRouteLink(event, "/studio")}
          >
            Estúdio
          </Link>
          <a ref={radioNavRef} href="#radio" aria-current={activeNav === "radio" ? "page" : undefined} onClick={(event) => { event.preventDefault(); openRadioFullscreen(false); }}>Rádio</a>
        </nav>

        <div className={styles.headerActions} data-radio-dock-actions="true">
          <RadioNavbarDock
            miniRef={dockMiniRef}
            visible={radioDocked && !radioDockMotion && !radioFullscreen}
            animating={radioDockMotion !== null}
            onRestore={() => runRadioDockTransition(false)}
          />
          <SocialIcons />
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          Menu
        </button>

        {mobileMenuOpen ? (
          <nav
            id="mobile-navigation"
            className={styles.mobileNav}
            aria-label="Navegação mobile"
          >
            <Link
              href="/"
              aria-current={activeNav === "home" ? "page" : undefined}
              onClick={(event) => {
                closeMobileMenu();
                handleStudioRouteLink(event, "/");
              }}
            >
              Início
            </Link>
            <Link
              href="/studio"
              aria-current={activeNav === "studio" ? "page" : undefined}
              onClick={(event) => {
                closeMobileMenu();
                handleStudioRouteLink(event, "/studio");
              }}
            >
              Estúdio
            </Link>
            <button
              type="button"
              aria-current={activeNav === "radio" ? "page" : undefined}
              onClick={() => {
                closeMobileMenu();
                openMobileRadio();
              }}
            >
              Rádio
            </button>
            <button type="button" disabled title="Página do Estúdio em breve">
              Sobre
            </button>
            <SocialIcons />
          </nav>
        ) : null}
      </header>

      <div
        className={styles.mobileMiniPlayer}
        role="region"
        aria-label="Mini player da CM Rádio"
        data-track-step={!mobileRadioOpen ? trackStepMotion?.kind : undefined}
        data-mobile-motion-endpoint={miniMotionEndpoint ? "true" : undefined}
      >
        <span className={styles.miniCover}><Image src={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="64px" unoptimized /></span>
        <span className={styles.miniMeta}>
          <strong>{radio.currentTrack?.title ?? previewTrack.title}</strong>
          <small>{radio.currentTrack?.artist ?? previewTrack.artist}</small>
        </span>
        <button
          ref={miniOpenButtonRef}
          type="button"
          className={styles.miniOpen}
          onClick={openMobileRadio}
          aria-label="Abrir rádio completa"
        >
          <Icon name="expand" />
          <span>Rádio</span>
        </button>
        <div className={styles.miniSignal}>
          <RadioVisualizer className={`${styles.visualizer} ${styles.miniVisualizer}`} barCount={24} active={!mobileRadioOpen} />
        </div>
        <div className={styles.miniControls}>
          <button type="button" className={styles.miniStep} onClick={radio.reshuffle} disabled={radio.tracks.length < 2} aria-label="Embaralhar e trocar de música" title="Embaralhar e trocar de música"><Icon name="shuffle" /></button>
          <button type="button" className={styles.miniStep} onClick={radio.toggleRepeatOne} disabled={!radio.currentTrack} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa" title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}><Icon name="repeat" /></button>
          <button type="button" className={styles.miniStep} onClick={previousTrack} disabled={!radio.currentTrack} aria-keyshortcuts="P" aria-label="Faixa anterior"><Icon name="previous" /></button>
          <button
            type="button"
            className={styles.miniPlay}
            onClick={radio.toggle}
            disabled={!radio.currentTrack}
            data-playback-state={radio.status}
            aria-busy={radio.status === "loading" || radio.status === "buffering"}
            aria-keyshortcuts="Space K"
            aria-label={radio.status === "loading" || radio.status === "buffering" ? "Cancelar reprodução" : radio.status === "playing" ? "Pausar" : "Tocar"}
          >
            <Icon name={radio.status === "playing" || radio.status === "loading" || radio.status === "buffering" ? "pause" : "play"} />
          </button>
          <button type="button" className={styles.miniStep} onClick={nextTrack} disabled={!radio.currentTrack || !radio.canSkipNext} aria-keyshortcuts="N" aria-label="Próxima faixa"><Icon name="next" /></button>
          <div
            ref={miniVolumeMenuRef}
            className={styles.volumeMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setMiniVolumeOpen(false);
            }}
          >
            <button
              ref={miniVolumeButtonRef}
              type="button"
              className={`${styles.miniStep} ${styles.volumeTrigger}`}
              onClick={() => setMiniVolumeOpen((open) => !open)}
              disabled={!radio.currentTrack}
              aria-label={`Volume ${Math.round(radio.volume * 100)}%. ${miniVolumeOpen ? "Fechar" : "Abrir"} controle`}
              aria-expanded={miniVolumeOpen}
              aria-controls={miniVolumeOpen ? "mini-radio-volume" : undefined}
            >
              <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
            </button>
            {miniVolumeOpen ? (
              <div id="mini-radio-volume" className={styles.volumePopover} role="group" aria-label="Controle de volume">
                <button type="button" className={styles.muteButton} onClick={radio.toggleMute} aria-label={radio.volume === 0 ? "Ativar som" : "Silenciar"}>
                  <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
                </button>
                <input
                className={styles.volumeSlider}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={radio.volume}
                onChange={(event) => radio.setVolume(Number(event.target.value))}
                aria-label="Volume"
                aria-valuetext={`${Math.round(radio.volume * 100)}%`}
                style={{ "--volume-level": `${Math.round(radio.volume * 100)}%` } as CSSProperties}
              />
                <span className={styles.volumeLevel}>{Math.round(radio.volume * 100)}%</span>
              </div>
            ) : null}
          </div>
          <button type="button" className={styles.miniStep} disabled aria-label="Favoritos indisponíveis nesta prévia"><Icon name="heart" /></button>
        </div>
        <span className={styles.miniProgress} aria-hidden="true">
          <span style={{ width: radio.duration > 0 ? `${radio.position / radio.duration * 100}%` : "0%" }} />
        </span>
      </div>

      <div
        ref={shellRef}
        className={styles.desktopShell}
        data-dragging={dragging ? "true" : undefined}
      >
        <main
          id="studio"
          className={styles.studio}
          data-studio-route={studioRoute}
          data-studio-transition={studioRouteMotion ?? undefined}
          inert={radioFullscreen}
        >
          <div className={styles.studioMachine} aria-hidden="true" />
          <div className={styles.studioStageShade} aria-hidden="true" />

          <div
            className={styles.studioCatalogHeader}
            aria-hidden={!studioHub}
          >
            <strong>ESTÚDIO DE IMPRESSÃO 3D</strong>
            <span>PROJETOS PERSONALIZADOS, PEÇAS PRODUZIDAS E PRODUTOS PRONTOS.</span>
          </div>

          <section
            className={styles.studioIdentity}
            aria-labelledby="studio-title"
            data-studio-intro={studioRoute === "home" ? "home" : undefined}
          >
            <div className={styles.studioEyebrowStack} aria-live="off">
              <span key={studioIntroCycle} aria-hidden={studioRoute !== "home"}>{revealPhrase("ESTÚDIO DE CRIAÇÃO", 0, 24)}</span>
              <span aria-hidden={studioRoute !== "detail"}>ESTÚDIO DE IMPRESSÃO 3D</span>
            </div>

            <h1 id="studio-title" aria-label="Ideias que ganham forma.">
              <span key={studioIntroCycle}>
                <span className={styles.studioRevealLine}>{revealPhrase("Ideias que", 120, 36)}</span>
                <br />
                <span className={styles.studioRevealLine}>
                  {revealPhrase("ganham", 120 + 10 * 36, 36)}
                  {" "}
                  <span className={styles.studioRevealAccent}>{revealPhrase("forma.", 120 + 17 * 36, 36)}</span>
                </span>
              </span>
            </h1>

            <p className={styles.lead} aria-label="Peças, materiais e cores produzidos com precisão, camada por camada.">
              <span key={studioIntroCycle}>
                <span className={styles.studioRevealLine}>{revealPhrase("Peças, materiais e cores produzidos", 420, 14)}</span>
                <br className={styles.leadBreak} />
                <span className={styles.studioRevealLine}>{revealPhrase("com precisão, camada por camada.", 420 + 38 * 14, 14)}</span>
              </span>
            </p>

            <div className={styles.studioRouteActions}>
              <Link
                href="/studio"
                className={styles.primaryAction}
                aria-label="Explore o estúdio"
                aria-hidden={studioRoute !== "home"}
                tabIndex={studioRoute === "home" ? 0 : -1}
                onPointerEnter={() => router.prefetch("/studio")}
                onClick={(event) => handleStudioRouteLink(event, "/studio")}
              >
                <span>Explore o estúdio</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/"
                className={styles.primaryAction}
                aria-label="Voltar ao início"
                aria-hidden={studioRoute !== "detail"}
                tabIndex={studioRoute === "detail" ? 0 : -1}
                onClick={(event) => handleStudioRouteLink(event, "/")}
              >
                <span>Voltar ao início</span>
                <span aria-hidden="true">←</span>
              </Link>
            </div>
          </section>

          <motion.div
            className={styles.studioDetailRail}
            aria-hidden={!studioHub}
            inert={!studioHub}
            data-studio-motion-owner="motion"
            initial={reduceStudioMotion ? false : "hidden"}
            animate={studioHub ? "shown" : "hidden"}
            variants={reduceStudioMotion ? undefined : studioHubRailVariants}
          >
            <motion.section
              className={styles.studioDetailCard}
              data-studio-card="prints"
              aria-label="Impressões em destaque"
              custom="left"
              variants={reduceStudioMotion ? studioHubInstantVariants : studioHubCardVariants}
            >
              <StudioPrintsCarousel active={studioHub && !radioFullscreen} />
            </motion.section>

            <StudioMotionLink
              className={styles.studioDetailCard}
              data-studio-card="quote"
              custom="right"
              variants={reduceStudioMotion ? studioHubInstantVariants : studioHubCardVariants}
              whileHover={reduceStudioMotion ? undefined : { y: -3 }}
              whileTap={reduceStudioMotion ? undefined : { scale: 0.992 }}
              href="/studio/orcamento"
              aria-label="Pedir orçamento"
              tabIndex={studioHub ? 0 : -1}
            >
              <span className={styles.studioCardLabel}>PROJETO PERSONALIZADO</span>
              <strong>Peça um orçamento</strong>
              <p>Conte o que você precisa. O fluxo pergunta somente o que faz sentido para o projeto.</p>
              <span className={styles.studioCardAction}>Pedir orçamento →</span>
            </StudioMotionLink>

            <StudioMotionLink
              className={styles.studioDetailCard}
              data-studio-card="products"
              custom="right"
              variants={reduceStudioMotion ? studioHubInstantVariants : studioHubCardVariants}
              whileHover={reduceStudioMotion ? undefined : { y: -3 }}
              whileTap={reduceStudioMotion ? undefined : { scale: 0.992 }}
              href="/studio/produtos"
              aria-label="Ver produtos do estúdio"
              tabIndex={studioHub ? 0 : -1}
            >
              <span className={styles.studioCardMediaPlaceholder} aria-hidden="true">
                FOTO REAL PENDENTE · produto
              </span>
              <span className={styles.studioCardLabel}>PRODUTOS</span>
              <strong>Peças prontas para comprar</strong>
              <p>Conheça cada produto aqui e finalize a compra na Shopee quando estiver disponível.</p>
              <span className={styles.studioCardAction}>Ver produtos →</span>
            </StudioMotionLink>
          </motion.div>

          {studioNestedRoute ? (
            <div className={styles.studioRouteContent} data-studio-route-content="true">{children}</div>
          ) : null}
        </main>

        <div
          ref={resizeHandleRef}
          className={styles.resizeHandle}
          data-resize-hint={showResizeHint && !radioFullscreen ? "true" : undefined}
          role="separator"
          aria-label={radioFullscreen ? "Arraste para a direita para mostrar o Estúdio" : "Arraste para redimensionar CM Rádio"}
          aria-orientation="vertical"
          aria-valuemin={radioFullscreen ? undefined : MIN_RADIO_WIDTH}
          aria-valuemax={radioFullscreen ? undefined : MAX_RADIO_WIDTH}
          aria-valuenow={radioFullscreen ? undefined : Math.round(radioWidth ?? DEFAULT_RADIO_WIDTH)}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={handleResizeKeyDown}
          title={radioFullscreen ? "Arraste para a direita para mostrar o Estúdio" : "Arraste para ajustar livremente a largura da CM Rádio"}
        />

        <aside id="radio" className={styles.radioPanel} data-radio-flip-root="true" aria-label="CM Rádio" inert={radioDocked} aria-hidden={radioDocked}>
          <RadioContent
            focus={radioExpanded && !radioFullscreen}
            visualizerActive={!radioDocked}
            expanded={radioFullscreen}
            trackStepKind={trackStepMotion?.kind}
            onPrevious={previousTrack}
            onNext={nextTrack}
            onReshuffle={radio.reshuffle}
            onDock={dockRadio}
            onExpand={() => openRadioFullscreen(false)}
            onMedium={showMediumRadio}
          />
        </aside>
      </div>

      <div ref={dockFlightRef} className={styles.radioDockFlight} aria-hidden="true" data-radio-dock-flight="true">
        <Image
          src={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"}
          fill
          sizes="(min-width: 1180px) 60vw, 480px"
          unoptimized
          alt=""
          className={styles.radioDockFlightArtwork}
        />
        <span className={styles.radioDockFlightCaption}>
          <strong>{radio.currentTrack?.title ?? "CM Rádio"}</strong>
          <small>{radio.currentTrack?.artist ?? "Aguardando catálogo"}</small>
        </span>
      </div>

      {radioDocked ? (
        <button
          type="button"
          className={styles.radioDockEdge}
          data-radio-dock-edge="true"
          aria-label="Arraste para a esquerda para voltar a Rádio ao tamanho médio"
          title="Arraste para voltar a Rádio ao tamanho médio"
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            dockEdgeDragRef.current = { pointerId: event.pointerId, startX: event.clientX };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const drag = dockEdgeDragRef.current;
            dockEdgeDragRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            if (drag?.pointerId === event.pointerId && drag.startX - event.clientX >= RADIO_DOCK_EDGE_RESTORE_PX) {
              restoreMediumFromPocket();
            }
          }}
          onPointerCancel={() => { dockEdgeDragRef.current = null; }}
          onKeyDown={(event) => {
            if (["Enter", " ", "ArrowLeft"].includes(event.key)) {
              event.preventDefault();
              restoreMediumFromPocket();
            }
          }}
        />
      ) : null}

      <dialog
        ref={mobileDialogRef}
        className={styles.mobileDialog}
        data-mobile-motion-endpoint={dialogMotionEndpoint ? "true" : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeMobileRadio();
        }}
        onClose={() => setMobileRadioOpen(false)}
        aria-label="CM Rádio completa"
      >
        <RadioContent
          mobile
          mobileMotionEndpoint={dialogMotionEndpoint}
          trackStepKind={trackStepMotion?.kind}
          onPrevious={previousTrack}
          onNext={nextTrack}
          onReshuffle={radio.reshuffle}
          onClose={closeMobileRadio}
        />
      </dialog>
    </div>
  );
}
