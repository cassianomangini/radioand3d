"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { flushSync } from "react-dom";
import styles from "./studio-radio-shell.module.css";
import { RadioLyrics } from "@/features/radio/radio-lyrics";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";
import {
  createRadioSnapPoints,
  getRadioDragMagnet,
  getRadioDragPreview,
  getRadioReleaseTarget,
  type RadioSnapKind
} from "./radio-panel-drag";

const DEFAULT_RADIO_WIDTH = 480;
const MIN_RADIO_WIDTH = 400;
const MAX_RADIO_WIDTH = 720;
const MIN_STUDIO_WIDTH = 640;
const RESIZE_GUTTER = 68;

type ViewTransitionLike = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

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

type IconName = "expand" | "close" | "heart" | "shuffle" | "repeat" | "previous" | "play" | "pause" | "next" | "search" | "volume" | "volumeMute";

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    heart: <path d="M20.8 8.6c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    shuffle: <><path d="M4 7h3c4 0 6 10 10 10h3m-3-3 3 3-3 3M4 17h3c1.7 0 3-1.7 4.3-3.7M16 7h4m-3-3 3 3-3 3" /></>,
    repeat: <><path d="M18 7H7a3 3 0 0 0-3 3v2m0-5 3-3M4 7 1 4m5 13h11a3 3 0 0 0 3-3v-2m0 5-3 3m3-3 3 3" /></>,
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
  return clampRadioWidth(shellWidth, shellWidth * 0.48);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function formatTrackDuration(seconds?: number) {
  return seconds && Number.isFinite(seconds) && seconds > 0 ? formatTime(seconds) : "—";
}

function RadioContent({ mobile = false, expanded = false, onClose }: { mobile?: boolean; expanded?: boolean; onClose?: () => void }) {
  const radio = useRadio();
  const [query, setQuery] = useState("");
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [trackFlight, setTrackFlight] = useState<{ id: string; phase: "source" | "destination" } | null>(null);
  const trackMotionTokenRef = useRef(0);
  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const volumePanelId = mobile ? "mobile-radio-volume" : "desktop-radio-volume";
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const listTracks = radio.upcomingTracks
    .map((track, index) => ({ track, position: index + 1 }))
    .filter(({ track }) =>
      `${track.title} ${track.artist}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
    );
  const displayTrack = radio.currentTrack ?? previewTrack;
  const canPlay = Boolean(radio.currentTrack);
  const playing = radio.status === "playing";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const currentArtwork = radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png";
  const progress = radio.duration > 0 ? Math.min(100, radio.position / radio.duration * 100) : 0;

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
      data-track-flight={trackFlight?.phase}
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

      <div className={styles.progressBlock} data-radio-motion-key="progress">
        <input
          className={styles.progressSeek}
          type="range"
          min={0}
          max={radio.duration || 1}
          step={0.1}
          value={Math.min(radio.position, radio.duration || 1)}
          onChange={(event) => radio.seek(Number(event.target.value))}
          disabled={!canPlay || radio.duration === 0}
          aria-label="Posição da música"
          style={{ "--seek-progress": `${progress}%` } as CSSProperties}
        />
        <div className={styles.progressTimes}>
          <span>{formatTime(radio.position)}</span>
          <span>{canPlay ? formatTrackDuration(radio.duration) : previewTrack.duration}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles da rádio" data-radio-motion-key="transport">
        <button type="button" className={styles.modeButton} onClick={radio.reshuffle} disabled={radio.tracks.length < 2} aria-label="Nova ordem aleatória" data-tooltip="Embaralhar lista do zero"><Icon name="shuffle" /></button>
        <button type="button" className={styles.modeButton} onClick={radio.toggleRepeatOne} disabled={!canPlay} aria-pressed={radio.repeatOne} aria-label="Repetir faixa" title={radio.repeatOne ? "Desligar repetição" : "Repetir faixa"}><Icon name="repeat" /></button>
        <button type="button" onClick={radio.previous} disabled={!canPlay} aria-label="Faixa anterior"><Icon name="previous" /></button>
        <button
          type="button"
          className={styles.playButton}
          onClick={radio.toggle}
          disabled={!canPlay}
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <Icon name={playing || pending ? "pause" : "play"} />
        </button>
        <button type="button" onClick={radio.next} disabled={!canPlay || !radio.canSkipNext} aria-label="Próxima faixa"><Icon name="next" /></button>
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
              <input type="range" min={0} max={1} step={0.01} value={radio.volume} onChange={(event) => radio.setVolume(Number(event.target.value))} aria-label="Volume" aria-valuetext={`${Math.round(radio.volume * 100)}%`} />
              <span className={styles.volumeLevel}>{Math.round(radio.volume * 100)}%</span>
            </div>
          ) : null}
        </div>
        <button type="button" className={styles.modeButton} disabled aria-label="Favoritos indisponíveis nesta prévia" title="Favoritos em breve"><Icon name="heart" /></button>
      </div>

      <RadioVisualizer className={styles.visualizer} motionKey="visualizer" />

      <div className={styles.queueHeader} data-radio-motion-key="queue-header">
        <h3>A seguir</h3>
        <label className={styles.searchField}>
          <span className={styles.srOnly}>Buscar nas próximas músicas</span>
          <Icon name="search" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar em A seguir..."
          />
        </label>
      </div>

      <ol className={styles.trackList} aria-label="Próximas músicas na ordem de reprodução" data-radio-motion-key="queue-list">
        {listTracks.map(({ track, position }) => (
          <li key={`${track.id}-${position}`}>
            <button
              type="button"
              className={styles.trackRow}
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
          <li className={styles.emptyState}>{normalizedQuery ? "Nenhuma próxima música encontrada." : "Não há próximas músicas nesta fila."}</li>
        ) : null}
      </ol>
      {mobile || expanded ? (
        <RadioLyrics
          trackId={radio.currentTrack?.id}
          title={radio.currentTrack?.title}
          headingId={mobile ? "mobile-radio-lyrics-title" : "radio-lyrics-title"}
        />
      ) : null}
      {radio.error ? <p className={styles.playerMessage} role="alert">{radio.error} <button type="button" onClick={radio.retry}>Tentar novamente</button></p> : null}
      {!radio.error && radio.currentTrack?.fixture ? <p className={styles.playerMessage}>Áudio sintético para teste local. Nenhuma música foi publicada.</p> : null}
    </div>
  );
}

export function StudioRadioShell() {
  const radio = useRadio();
  const shellRef = useRef<HTMLDivElement>(null);
  const radioNavRef = useRef<HTMLAnchorElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
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
  const pointerActiveRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const dragFullscreenRef = useRef(false);
  const dragRestoredRef = useRef(false);
  const returnDistanceRef = useRef(0);
  const returnOffsetRef = useRef(0);
  const openedFromDragRef = useRef(false);
  const previewResetFrameRef = useRef<number | null>(null);
  const motionResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dividerSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [radioWidth, setRadioWidth] = useState<number | null>(null);
  const [radioExpanded, setRadioExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [radioFullscreen, setRadioFullscreen] = useState(false);
  const [layoutMotionDirection, setLayoutMotionDirection] = useState<"opening" | "closing" | null>(null);
  const [dividerSettling, setDividerSettling] = useState(false);
  const [mobileRadioOpen, setMobileRadioOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniVolumeOpen, setMiniVolumeOpen] = useState(false);
  const miniVolumeMenuRef = useRef<HTMLDivElement>(null);
  const miniVolumeButtonRef = useRef<HTMLButtonElement>(null);

  const shellStyle = useMemo(
    () =>
      (radioWidth === null
        ? {}
        : { "--radio-width": `${radioWidth}px` }) as CSSProperties,
    [radioWidth]
  );

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
      if (media.matches) setRadioFullscreen(false);
    }
    media.addEventListener("change", leaveDesktop);
    return () => media.removeEventListener("change", leaveDesktop);
  }, []);

  useEffect(() => () => {
    if (motionResetTimerRef.current !== null) clearTimeout(motionResetTimerRef.current);
    if (dividerSettleTimerRef.current !== null) clearTimeout(dividerSettleTimerRef.current);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = shell.getBoundingClientRect().width;
      setRadioWidth((current) =>
        radioExpanded
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
      });
      return;
    }

    runRadioMotion("opening", () => {
      setRadioWidth(getExpandedWidth(shellWidth));
      setRadioExpanded(true);
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

    if (dividerSettleTimerRef.current !== null) {
      clearTimeout(dividerSettleTimerRef.current);
    }

    setDividerSettling(true);
    customWidthRef.current = snap === "compact";
    setRadioExpanded(snap === "focus");
    setRadioWidth(targetWidth);

    dividerSettleTimerRef.current = setTimeout(() => {
      setDividerSettling(false);
      dividerSettleTimerRef.current = null;
    }, 460);
  }

  function clearReturnPreview() {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.removeProperty("--radio-return-offset");
    delete shell.dataset.radioReturning;
    returnOffsetRef.current = 0;
  }

  function runRadioMotion(direction: "opening" | "closing", update: () => void) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motionResetTimerRef.current !== null) {
      clearTimeout(motionResetTimerRef.current);
      motionResetTimerRef.current = null;
    }

    if (reduce) {
      setLayoutMotionDirection(null);
      update();
      return;
    }

    const clearMotionState = () => {
      setLayoutMotionDirection(null);
      motionResetTimerRef.current = null;
    };

    const documentWithTransition = document as DocumentWithViewTransition;
    if (documentWithTransition.startViewTransition) {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          setLayoutMotionDirection(direction);
          update();
        });
      });
      void transition.finished.finally(clearMotionState);
      return;
    }

    setLayoutMotionDirection(direction);
    update();
    motionResetTimerRef.current = setTimeout(clearMotionState, 720);
  }

  function openRadioFullscreen(fromDrag: boolean) {
    if (!fromDrag) {
      const width = shellRef.current?.getBoundingClientRect().width;
      initialRadioWidthRef.current = radioWidth ?? (width ? getDefaultWidth(width) : DEFAULT_RADIO_WIDTH);
    }
    openedFromDragRef.current = fromDrag;
    dragFullscreenRef.current = true;
    runRadioMotion("opening", () => {
      clearDragPreview();
      setRadioFullscreen(true);
    });
  }

  function closeRadioFullscreen(restoreFocus = true) {
    runRadioMotion("closing", () => {
      clearDragPreview();
      dragFullscreenRef.current = false;
      customWidthRef.current = true;
      setRadioWidth(initialRadioWidthRef.current);
      setRadioExpanded(false);
      setRadioFullscreen(false);
      clearReturnPreview();
    });
    if (restoreFocus) {
      requestAnimationFrame(() => {
        (openedFromDragRef.current ? resizeHandleRef.current : radioNavRef.current)?.focus();
      });
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerActiveRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (previewResetFrameRef.current !== null) cancelAnimationFrame(previewResetFrameRef.current);
    previewResetFrameRef.current = null;
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    dragOriginRef.current = radioFullscreen ? "fullscreen" : "sidebar";
    if (!radioFullscreen) initialRadioWidthRef.current = radioWidth ?? getDefaultWidth(rect.width);
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
    const shouldToggle = event.type === "pointerup" && !pointerMovedRef.current;
    const shouldRestore = event.type === "pointercancel" && dragOriginRef.current === "sidebar" && dragFullscreenRef.current;
    const shouldReturn = event.type === "pointerup" && dragOriginRef.current === "fullscreen" && returnOffsetRef.current >= returnDistanceRef.current / 2;
    const shouldSettle =
      event.type === "pointerup" &&
      pointerMovedRef.current &&
      dragOriginRef.current === "sidebar" &&
      !dragFullscreenRef.current &&
      !dragRestoredRef.current;

    pointerActiveRef.current = false;
    setDragging(false);

    if (shouldRestore || shouldReturn) {
      closeRadioFullscreen(false);
    } else if (shouldToggle) {
      if (radioFullscreen) closeRadioFullscreen();
      else toggleRadioExpanded();
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
      customWidthRef.current = true;
      updateRadioWidth((radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width)) - step);
      setRadioExpanded(false);
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

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div id="top" className={styles.site} style={shellStyle} data-radio-expanded={radioExpanded ? "true" : undefined} data-radio-dragging={dragging ? "true" : undefined} data-radio-fullscreen={radioFullscreen ? "true" : undefined} data-radio-layout-motion={layoutMotionDirection ?? undefined} data-radio-divider-settling={dividerSettling ? "true" : undefined}>
      <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="CM 3D e Rádio, início" onClick={() => { if (radioFullscreen) closeRadioFullscreen(false); }}>
          <Image src="/images/cm-3d-radio-logo.png" alt="" width={1983} height={793} priority unoptimized />
        </a>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <a href="#top" onClick={() => { if (radioFullscreen) closeRadioFullscreen(false); }}>Início</a>
          <a href="#studio" onClick={() => { if (radioFullscreen) closeRadioFullscreen(false); }}>Estúdio</a>
          <a ref={radioNavRef} href="#radio" onClick={(event) => { event.preventDefault(); openRadioFullscreen(false); }}>Rádio</a>
        </nav>

        <SocialIcons />

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
            <a href="#top" onClick={closeMobileMenu}>
              Início
            </a>
            <a href="#studio" onClick={closeMobileMenu}>
              Estúdio
            </a>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                setMobileRadioOpen(true);
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

      <div className={styles.mobileMiniPlayer} role="region" aria-label="Mini player da CM Rádio">
        <span className={styles.miniCover}><Image src={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="64px" unoptimized /></span>
        <span className={styles.miniMeta}>
          <strong>{radio.currentTrack?.title ?? previewTrack.title}</strong>
          <small>{radio.currentTrack?.artist ?? previewTrack.artist}</small>
        </span>
        <button
          type="button"
          className={styles.miniOpen}
          onClick={() => {
            setMiniVolumeOpen(false);
            setMobileRadioOpen(true);
          }}
          aria-label="Abrir rádio completa"
        >
          <Icon name="expand" />
          <span>Rádio</span>
        </button>
        <div className={styles.miniSignal}>
          <RadioVisualizer className={`${styles.visualizer} ${styles.miniVisualizer}`} barCount={24} active={!mobileRadioOpen} />
        </div>
        <div className={styles.miniControls}>
          <button type="button" className={styles.miniStep} onClick={radio.reshuffle} disabled={radio.tracks.length < 2} aria-label="Nova ordem aleatória"><Icon name="shuffle" /></button>
          <button type="button" className={styles.miniStep} onClick={radio.toggleRepeatOne} disabled={!radio.currentTrack} aria-pressed={radio.repeatOne} aria-label="Repetir faixa"><Icon name="repeat" /></button>
          <button type="button" className={styles.miniStep} onClick={radio.previous} disabled={!radio.currentTrack} aria-label="Faixa anterior"><Icon name="previous" /></button>
          <button
            type="button"
            className={styles.miniPlay}
            onClick={radio.toggle}
            disabled={!radio.currentTrack}
            aria-label={radio.status === "loading" || radio.status === "buffering" ? "Cancelar reprodução" : radio.status === "playing" ? "Pausar" : "Tocar"}
          >
            <Icon name={radio.status === "playing" || radio.status === "loading" || radio.status === "buffering" ? "pause" : "play"} />
          </button>
          <button type="button" className={styles.miniStep} onClick={radio.next} disabled={!radio.currentTrack || !radio.canSkipNext} aria-label="Próxima faixa"><Icon name="next" /></button>
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
                <input type="range" min={0} max={1} step={0.01} value={radio.volume} onChange={(event) => radio.setVolume(Number(event.target.value))} aria-label="Volume" aria-valuetext={`${Math.round(radio.volume * 100)}%`} />
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
        <main id="studio" className={styles.studio} inert={radioFullscreen}>
          <section className={styles.hero} aria-labelledby="studio-title">
            <div className={styles.heroContent}>
              <p className={styles.studioEyebrow}>ESTÚDIO DE CRIAÇÃO</p>
              <h1 id="studio-title" aria-label="Ideias que ganham forma.">Ideias que<br />ganham <span>forma.</span></h1>
              <p className={styles.lead}>
                Peças, materiais e cores produzidos<br className={styles.leadBreak} /> com precisão, camada por camada.
              </p>
              <button
                type="button"
                className={styles.primaryAction}
                disabled
                title="Página do Estúdio em breve"
                aria-label="Explore o estúdio — página do Estúdio em breve"
              >
                <span>Explore o estúdio</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </main>

        <div
          ref={resizeHandleRef}
          className={styles.resizeHandle}
          role={radioFullscreen ? "button" : "separator"}
          aria-label={radioFullscreen ? "Arraste para a direita para mostrar o Estúdio" : "Redimensionar ou expandir CM Rádio"}
          aria-orientation={radioFullscreen ? undefined : "vertical"}
          aria-valuemin={radioFullscreen ? undefined : MIN_RADIO_WIDTH}
          aria-valuemax={radioFullscreen ? undefined : MAX_RADIO_WIDTH}
          aria-valuenow={radioFullscreen ? undefined : Math.round(radioWidth ?? DEFAULT_RADIO_WIDTH)}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={handleResizeKeyDown}
          title={radioFullscreen ? "Arraste para a direita ou clique para mostrar o Estúdio" : "Clique para expandir ou recolher; arraste para ajustar a largura ou abrir a Rádio"}
        />

        <aside id="radio" className={styles.radioPanel} aria-label="CM Rádio">
          <RadioContent expanded={radioFullscreen} />
        </aside>
      </div>

      <dialog
        ref={mobileDialogRef}
        className={styles.mobileDialog}
        onCancel={(event) => {
          event.preventDefault();
          setMobileRadioOpen(false);
        }}
        onClose={() => setMobileRadioOpen(false)}
        aria-label="CM Rádio completa"
      >
        <RadioContent mobile onClose={() => setMobileRadioOpen(false)} />
      </dialog>
    </div>
  );
}
