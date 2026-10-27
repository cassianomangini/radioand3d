"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { RadioLyrics } from "@/features/radio/radio-lyrics";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { Button } from "./button";
import styles from "./radio-panel.module.css";

type IconName = "expand" | "medium" | "close" | "dice" | "repeat" | "previous" | "play" | "pause" | "next" | "volume" | "volumeMute";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
    medium: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M14 4v16" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    dice: <>
      <g stroke="none">
        <rect x="0.5" y="2.4" width="15" height="15" rx="3.1" fill="var(--accent-cyan)" />
        <circle cx="4.5" cy="6.2" r="1.65" fill="var(--text-primary)" />
        <circle cx="8" cy="9.9" r="1.65" fill="var(--text-primary)" />
        <circle cx="11.5" cy="13.6" r="1.65" fill="var(--text-primary)" />
      </g>
      <g stroke="none">
        <rect x="18.5" y="0.6" width="15" height="15" rx="3.1" fill="var(--accent-violet)" />
        <circle cx="22.5" cy="4.6" r="1.65" fill="var(--text-primary)" />
        <circle cx="29.5" cy="4.6" r="1.65" fill="var(--text-primary)" />
        <circle cx="22.5" cy="11.6" r="1.65" fill="var(--text-primary)" />
        <circle cx="29.5" cy="11.6" r="1.65" fill="var(--text-primary)" />
      </g>
    </>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" /><path d="m11 11 1-1v5" /></>,
    previous: <><path d="M5 5v14" /><path d="m19 5-11 7 11 7V5Z" fill="currentColor" stroke="none" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <><rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /></>,
    next: <><path d="M19 5v14" /><path d="m5 5 11 7-11 7V5Z" fill="currentColor" stroke="none" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" /></>,
    volumeMute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
  };

  return (
    <svg
      width={20}
      height={20}
      viewBox={name === "dice" ? "0 0 34 18" : "0 0 24 24"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const FALLBACK_ART = "/images/cm-radio-preview-art.png";

function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  return formatTime(seconds);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function RadioPanel({
  expanded,
  onClose,
  onToggleSize,
}: {
  expanded: boolean;
  onClose: () => void;
  onToggleSize: () => void;
}) {
  const radio = useRadio();
  const track = radio.currentTrack;
  const playing = radio.status === "playing" || radio.status === "buffering";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const artwork = track?.artwork ?? FALLBACK_ART;
  const canPlay = Boolean(track);
  const scrubbingRef = useRef(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const displayedPosition = scrubbing && seekPreview !== null ? seekPreview : radio.position;
  const progress = radio.duration > 0 ? Math.min(100, (displayedPosition / radio.duration) * 100) : 0;

  function stopScrubbing() {
    scrubbingRef.current = false;
    setScrubbing(false);
    setSeekPreview(null);
  }

  return (
    <section
      className={styles.panel}
      aria-label="CM Rádio"
      data-expanded={expanded ? "true" : undefined}
      data-radio-fullscreen={expanded ? "true" : undefined}
    >
      <header className={styles.header}>
        <h2><span>CM</span> RÁDIO</h2>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.layoutButton}
            data-layout-action="expand"
            onClick={onToggleSize}
            aria-label={expanded ? "Voltar a Rádio ao tamanho médio" : "Expandir a Rádio"}
            title={expanded ? "Tamanho médio" : "Tela cheia"}
          >
            <Icon name={expanded ? "medium" : "expand"} />
          </button>
          <button
            type="button"
            className={styles.layoutButton}
            data-layout-action="close"
            onClick={onClose}
            aria-label="Fechar rádio"
            title="Fechar"
          >
            <Icon name="close" />
          </button>
        </div>
      </header>

      <div className={styles.cover}>
        <Image src={artwork} alt="Arte visual da CM Rádio" fill sizes="30vw" unoptimized />
        <div className={styles.caption}>
          <strong>{track?.title ?? "Nenhuma faixa carregada"}</strong>
          {track ? <span>{track.artist}</span> : null}
        </div>
        {!track || track.fixture ? (
          <span className={styles.badge}>{track?.fixture ? "TESTE" : "PRÉVIA"}</span>
        ) : null}
      </div>

      <div
        className={styles.progress}
        data-scrubbing={scrubbing ? "true" : undefined}
        style={{ "--seek-progress": `${progress}%` } as CSSProperties}
      >
        <input
          className={styles.seek}
          type="range"
          min={0}
          max={radio.duration || 1}
          step={0.1}
          value={Math.min(displayedPosition, radio.duration || 1)}
          onPointerDown={() => {
            scrubbingRef.current = true;
            setScrubbing(true);
            setSeekPreview(radio.position);
          }}
          onPointerUp={(event) => {
            radio.seek(Number(event.currentTarget.value));
            stopScrubbing();
          }}
          onPointerCancel={stopScrubbing}
          onBlur={stopScrubbing}
          onChange={(event) => {
            const nextPosition = Number(event.target.value);
            if (scrubbingRef.current) setSeekPreview(nextPosition);
            radio.seek(nextPosition);
          }}
          disabled={!canPlay || radio.duration === 0}
          aria-label="Posição da música"
          aria-valuetext={formatTime(displayedPosition)}
        />
        <output className={styles.seekPreview} aria-hidden="true">{formatTime(displayedPosition)}</output>
        <div className={styles.progressTimes}>
          <span>{formatTime(displayedPosition)}</span>
          <span>{formatTime(radio.duration)}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles da rádio">
        <button type="button" className={`${styles.modeButton} ${styles.shuffleButton}`} onClick={radio.reshuffle} disabled={!canPlay || radio.tracks.length < 2} aria-label="Sortear outra música">
          <Icon name="dice" />
        </button>
        <button type="button" className={styles.modeButton} onClick={radio.toggleRepeatOne} disabled={!canPlay} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa">
          <Icon name="repeat" />
        </button>
        <button type="button" onClick={radio.previous} disabled={!canPlay || !radio.hasPrevious} aria-label="Faixa anterior">
          <Icon name="previous" />
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={radio.toggle}
          disabled={!canPlay}
          data-playback-state={radio.status}
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <Icon name={playing || pending ? "pause" : "play"} />
        </button>
        <button type="button" onClick={radio.next} disabled={!canPlay || !radio.canSkipNext} aria-label="Próxima faixa">
          <Icon name="next" />
        </button>
        <button type="button" className={styles.modeButton} onClick={radio.toggleMute} disabled={!canPlay} aria-label={radio.volume === 0 ? "Ativar som" : "Silenciar"}>
          <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
        </button>
      </div>

      <RadioVisualizer className={styles.visualizer} active />

      <h2 className={styles.listHeading}>Playlist</h2>
      <ol className={styles.list} aria-label="Músicas da playlist">
        {radio.playlistTracks.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.track}
              aria-current={item.id === track?.id ? "true" : undefined}
              onClick={() => radio.select(item.id)}
            >
              <span className={styles.thumb}>
                <Image
                  src={item.artwork ?? FALLBACK_ART}
                  alt=""
                  fill
                  sizes="48px"
                  unoptimized
                />
              </span>
              <span className={styles.meta}>
                <strong>{item.title}</strong>
                <small>{item.artist}</small>
              </span>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.duration}>
                {formatDuration(
                  item.durationSeconds ?? (item.id === track?.id ? radio.duration : undefined)
                )}
              </span>
            </button>
          </li>
        ))}
        {radio.playlistTracks.length === 0 ? (
          <li className={styles.empty}>A playlist está vazia.</li>
        ) : null}
      </ol>

      <div className={styles.lyrics}>
        <RadioLyrics trackId={track?.id} title={track?.title} active />
      </div>

      {radio.error ? (
        <div className={styles.error} role="alert">
          <p>{radio.error}</p>
          <Button variant="secondary" onClick={radio.retry}>Tentar novamente</Button>
        </div>
      ) : null}
      {!radio.error && track?.fixture ? (
        <p className={styles.note}>
          Áudio sintético para teste local. Nenhuma música foi publicada.
        </p>
      ) : null}
    </section>
  );
}
