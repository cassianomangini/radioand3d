"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import styles from "./studio-radio-shell.module.css";
import sharedAudioStyles from "./radio-audio-controls.module.css";
import playerStyles from "./radio-content.module.css";
import { RadioLyrics } from "@/features/radio/radio-lyrics";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";
import type { DocumentWithViewTransition } from "./radio-view-transition";

// The full player is independent from shell geometry. Both player surfaces
// read the same RadioProvider; neither owns nor creates an HTMLAudioElement.
export const previewTrack = {
  title: "Limite Elástico",
  artist: "CM",
  duration: "3:52"
} as const;

export type TrackStepKind = "next" | "previous" | "shuffle";

type IconName = "expand" | "medium" | "close" | "heart" | "shuffle" | "repeat" | "previous" | "play" | "pause" | "next" | "search" | "volume" | "volumeMute" | "share" | "check";

export function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
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
    volumeMute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
    check: <path d="m4 12 5 5L20 6" />
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function formatTrackDuration(seconds?: number) {
  return seconds && Number.isFinite(seconds) && seconds > 0 ? formatTime(seconds) : "—";
}

export function RadioContent({
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
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
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
  const sharedSlug = pathname.startsWith("/musica/") ? pathname.slice("/musica/".length) : null;
  const sharedTrack = sharedSlug ? radio.tracks.find((track) => track.shareSlug === sharedSlug) : null;
  const sharedTrackNeedsPlay = Boolean(sharedTrack && (
    radio.currentTrack?.id !== sharedTrack.id ||
    !["playing", "loading", "buffering"].includes(radio.status)
  ));
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

  function trackLink(slug: string) {
    return new URL(`/musica/${slug}`, window.location.origin).toString();
  }

  async function copyTrackLink(slug: string) {
    const url = trackLink(slug);
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback("Link da música copiado.");
    } catch {
      window.prompt("Copie o link da música:", url);
    }
  }

  async function shareTrack(title: string, slug: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} — CM Rádio`, url: trackLink(slug) });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyTrackLink(slug);
  }

  useEffect(() => {
    if (!shareFeedback) return;
    const timeout = window.setTimeout(() => setShareFeedback(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [shareFeedback]);

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
      className={playerStyles.radioContent}
      data-radio-surface={mobile ? "mobile" : "desktop"}
      data-radio-focus={!mobile && focus ? "true" : undefined}
      data-mobile-panel={mobile ? mobilePanel : undefined}
      data-track-flight={trackFlight?.phase}
      data-track-step={trackStepKind}
      data-mobile-motion-endpoint={mobile && mobileMotionEndpoint ? "true" : undefined}
    >
      <div className={playerStyles.radioHeader} data-radio-motion-key="header">
        <h2><span>CM</span> RÁDIO</h2>

        {onClose ? (
          <button
            type="button"
            className={playerStyles.iconButton}
            onClick={onClose}
            aria-label={mobile ? "Fechar rádio" : "Voltar ao Estúdio"}
          >
            <Icon name="close" />
          </button>
        ) : null}
        {!mobile && (onDock || onExpand || onMedium) ? (
          <div className={playerStyles.radioLayoutActions}>
            {expanded && onMedium ? (
              <button
                type="button"
                className={playerStyles.iconButton}
                data-layout-action="expand"
                onClick={onMedium}
                aria-label="Voltar a Rádio ao tamanho médio"
                title="Tamanho médio"
              >
                <Icon name="medium" />
              </button>
            ) : onExpand ? (
              <button
                type="button"
                className={playerStyles.iconButton}
                data-layout-action="expand"
                onClick={onExpand}
                aria-label="Expandir a Rádio"
                title="Tela cheia"
              >
                <Icon name="expand" />
              </button>
            ) : null}
            {onDock ? (
              <button
                type="button"
                className={playerStyles.iconButton}
                data-layout-action="dock"
                onClick={onDock}
                aria-label="Minimizar a Rádio para a barra superior"
                title="Minimizar Rádio"
              >
                <Icon name="close" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {sharedTrack ? (
        <div className={playerStyles.sharedTrackPrompt} role="region" aria-label="Música compartilhada">
          <span>Recebeu esta música: <strong>{sharedTrack.title}</strong></span>
          {sharedTrackNeedsPlay ? (
            <button type="button" onClick={() => radio.selectShared(sharedTrack.id)}>
              ▶ Ouvir {sharedTrack.title}
            </button>
          ) : <span className={playerStyles.sharedTrackPlaying}>Tocando agora</span>}
        </div>
      ) : null}

      <div
        className={playerStyles.coverArt}
        data-shareable={radio.currentTrack?.shareSlug ? "true" : undefined}
        data-radio-motion-key="cover"
        data-track-flight-destination={trackFlight?.phase === "destination" ? "true" : undefined}
      >
        <Image src={currentArtwork} alt="Arte visual da CM Rádio" fill sizes="(min-width: 1180px) 720px, 100vw" priority unoptimized />
        <div
          className={playerStyles.coverCaption}
          data-track-flight-destination={trackFlight?.phase === "destination" ? "true" : undefined}
        >
          <strong>{displayTrack.title}</strong>
          <span>{displayTrack.artist}</span>
        </div>
        {!radio.currentTrack || radio.currentTrack.fixture ? <span className={playerStyles.coverBadge}>{radio.currentTrack?.fixture ? "TESTE" : "PRÉVIA"}</span> : null}
        {radio.currentTrack?.shareSlug ? (
          <button
            type="button"
            className={playerStyles.coverShare}
            onClick={() => void shareTrack(radio.currentTrack!.title, radio.currentTrack!.shareSlug!)}
            aria-label={`Compartilhar ${radio.currentTrack.title}`}
            title={`Compartilhar ${radio.currentTrack.title}`}
          >
            <Icon name={shareFeedback ? "check" : "share"} />
          </button>
        ) : null}
      </div>
      <span className={styles.srOnly} role="status">{shareFeedback}</span>

      <div
        className={playerStyles.progressBlock}
        data-radio-motion-key="progress"
        data-scrubbing={scrubbing ? "true" : undefined}
        style={{ "--seek-progress": `${progress}%` } as CSSProperties}
      >
        <input
          className={playerStyles.progressSeek}
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
        <output className={playerStyles.seekPreview} aria-hidden="true">
          {formatTime(displayedPosition)}
        </output>
        <div className={playerStyles.progressTimes}>
          <span>{formatTime(displayedPosition)}</span>
          <span>{canPlay ? formatTrackDuration(radio.duration) : previewTrack.duration}</span>
        </div>
      </div>

      <div className={playerStyles.transport} aria-label="Controles da rádio" data-radio-motion-key="transport">
        <button type="button" className={playerStyles.modeButton} data-radio-flip-key="control-shuffle" onClick={transportReshuffle} disabled={radio.tracks.length < 2} aria-label="Embaralhar e trocar de música" data-tooltip="Embaralhar e trocar de música"><Icon name="shuffle" /></button>
        <button type="button" className={playerStyles.modeButton} data-radio-flip-key="control-repeat" onClick={radio.toggleRepeatOne} disabled={!canPlay} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa" title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}><Icon name="repeat" /></button>
        <button type="button" data-radio-flip-key="control-previous" onClick={transportPrevious} disabled={!canPlay} aria-keyshortcuts="P" aria-label="Faixa anterior"><Icon name="previous" /></button>
        <button
          type="button"
          className={playerStyles.playButton}
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
          className={sharedAudioStyles.volumeMenu}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setVolumeOpen(false);
          }}
        >
          <button
            ref={volumeButtonRef}
            type="button"
            className={`${playerStyles.modeButton} ${sharedAudioStyles.volumeTrigger} ${playerStyles.volumeTrigger}`}
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
            <div id={volumePanelId} className={sharedAudioStyles.volumePopover} role="group" aria-label="Controle de volume">
              <button type="button" className={sharedAudioStyles.muteButton} onClick={radio.toggleMute} aria-label={radio.volume === 0 ? "Ativar som" : "Silenciar"} title={radio.volume === 0 ? "Ativar som" : "Silenciar"}>
                <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
              </button>
              <input
                className={sharedAudioStyles.volumeSlider}
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
              <span className={sharedAudioStyles.volumeLevel}>{Math.round(radio.volume * 100)}%</span>
            </div>
          ) : null}
        </div>
        <button type="button" className={playerStyles.modeButton} data-radio-flip-key="control-favorite" disabled aria-label="Favoritos indisponíveis nesta prévia" title="Favoritos em breve"><Icon name="heart" /></button>
      </div>

      <RadioVisualizer className={`${sharedAudioStyles.visualizer} ${playerStyles.visualizer}`} motionKey="visualizer" active={visualizerActive} />

      <div className={playerStyles.queueHeader} data-radio-motion-key="queue-header">
        <h3>Playlist</h3>
        {(!mobile || mobilePanel === "playlist") ? (
          <label className={playerStyles.searchField}>
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
          <button type="button" className={playerStyles.panelToggle} onClick={() => setMobilePanel((panel) => panel === "playlist" ? "lyrics" : "playlist")} aria-label={mobilePanel === "playlist" ? "Expandir letra" : "Expandir playlist"}>
            {mobilePanel === "playlist" ? "Letra ↓" : "↑"}
          </button>
        ) : null}
      </div>

      <ol
        ref={trackListRef}
        className={playerStyles.trackList}
        aria-label="Músicas da playlist"
        data-radio-motion-key="queue-list"
      >
        {listTracks.map(({ track, position }) => (
          <li key={track.id} data-track-id={track.id} className={playerStyles.shareableTrackRow}>
            <button
              type="button"
              className={playerStyles.trackRow}
              aria-current={track.id === radio.currentTrack?.id ? "true" : undefined}
              onClick={() => selectTrackWithMotion(track.id)}
              data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
            >
              <span
                className={playerStyles.trackThumb}
                data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
              ><Image src={track.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="48px" unoptimized /></span>
              <span
                className={playerStyles.trackMeta}
                data-track-flight-source={trackFlight?.phase === "source" && trackFlight.id === track.id ? "true" : undefined}
              ><strong>{track.title}</strong><small>{track.artist}</small></span>
              <span className={playerStyles.trackState}>{String(position).padStart(2, "0")}</span>
              <span className={playerStyles.duration}>{formatTrackDuration(track.durationSeconds ?? (track.id === radio.currentTrack?.id ? radio.duration : undefined))}</span>
            </button>
          </li>
        ))}
        {listTracks.length === 0 ? (
          <li className={playerStyles.emptyState}>{normalizedQuery ? "Nenhuma música encontrada." : "A playlist está vazia."}</li>
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
      {radio.error ? <p className={playerStyles.playerMessage} role="alert">{radio.error} <button type="button" onClick={radio.retry}>Tentar novamente</button></p> : null}
      {!radio.error && radio.currentTrack?.fixture ? <p className={playerStyles.playerMessage}>Áudio sintético para teste local. Nenhuma música foi publicada.</p> : null}
    </div>
  );
}

