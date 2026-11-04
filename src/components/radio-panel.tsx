"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RadioLyrics } from "@/features/radio/radio-lyrics";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { Button } from "./button";
import { RadioIcon } from "./radio-icons";
import { VolumeControl } from "./volume-control";
import styles from "./radio-panel.module.css";

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
  mobile = false,
  onClose,
  onToggleSize,
}: {
  expanded: boolean;
  mobile?: boolean;
  onClose: () => void;
  onToggleSize?: () => void;
}) {
  const radio = useRadio();
  const track = radio.currentTrack;
  const playing = radio.status === "playing" || radio.status === "buffering";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const artwork = track?.artwork ?? FALLBACK_ART;
  const canPlay = Boolean(track);
  const scrubbingRef = useRef(false);
  const listRef = useRef<HTMLOListElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"playlist" | "lyrics">("playlist");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const playlist = radio.playlistTracks
    .map((item, index) => ({ item, position: index + 1 }))
    .filter(({ item }) => `${item.title} ${item.artist}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  const displayedPosition = scrubbing && seekPreview !== null ? seekPreview : radio.position;
  const progress = radio.duration > 0 ? Math.min(100, (displayedPosition / radio.duration) * 100) : 0;

  useEffect(() => {
    if (!shareNotice) return;
    const timeout = window.setTimeout(() => setShareNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [shareNotice]);

  useEffect(() => {
    const list = listRef.current;
    const currentId = track?.id;
    if (!list || !currentId) return;
    if (mobile && mobilePanel !== "playlist") return;

    const alignCurrentTrack = () => {
      const row = list.querySelector<HTMLElement>(`[data-track-id="${CSS.escape(currentId)}"]`);
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
  }, [mobile, mobilePanel, track?.id]);

  function seekBy(seconds: number) {
    const base = scrubbingRef.current && seekPreview !== null ? seekPreview : radio.position;
    radio.seek(base + seconds);
  }

  async function shareTrack() {
    if (!track?.shareSlug) return;
    const url = new URL(`/musica/${track.shareSlug}`, window.location.origin).toString();
    const title = `${track.title} — CM Rádio`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice("Link copiado.");
    } catch {
      setShareNotice("Não foi possível copiar o link.");
    }
  }

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
      data-radio-surface={mobile ? "mobile" : "desktop"}
      data-mobile-panel={mobile ? mobilePanel : undefined}
    >
      <header className={styles.header}>
        <h2><span>CM</span> RÁDIO</h2>
        <div className={styles.headerActions}>
          {onToggleSize ? (
            <button
              type="button"
              className={styles.layoutButton}
              data-layout-action="expand"
              onClick={onToggleSize}
              aria-label={expanded ? "Voltar a Rádio ao tamanho médio" : "Expandir a Rádio"}
              title={expanded ? "Tamanho médio" : "Tela cheia"}
            >
              <RadioIcon name={expanded ? "medium" : "expand"} />
            </button>
          ) : null}
          <button
            type="button"
            className={styles.layoutButton}
            data-layout-action="close"
            onClick={onClose}
            aria-label={mobile ? "Fechar rádio" : "Minimizar a rádio"}
            title={mobile ? "Fechar" : "Minimizar"}
          >
            <RadioIcon name="close" />
          </button>
        </div>
      </header>

      <div className={styles.cover} data-shareable={track?.shareSlug ? "true" : undefined}>
        <Image src={artwork} alt="Arte visual da CM Rádio" fill sizes="30vw" unoptimized />
        <div className={styles.caption}>
          <strong>{track?.title ?? "Nenhuma faixa carregada"}</strong>
          {track ? <span>{track.artist}</span> : null}
        </div>
        {!track || track.fixture ? (
          <span className={styles.badge}>{track?.fixture ? "TESTE" : "PRÉVIA"}</span>
        ) : null}
        {track?.shareSlug ? (
          <button
            type="button"
            className={styles.shareButton}
            onClick={() => void shareTrack()}
            aria-label={`Compartilhar ${track.title}`}
            title={`Compartilhar ${track.title}`}
          >
            <RadioIcon name="share" />
          </button>
        ) : null}
        {shareNotice ? <span className={styles.shareNotice} role="status">{shareNotice}</span> : null}
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
          aria-keyshortcuts="ArrowLeft ArrowRight J L"
          aria-valuetext={formatTime(displayedPosition)}
          onKeyDown={(event) => {
            if (event.code === "ArrowLeft") seekBy(-5);
            else if (event.code === "ArrowRight") seekBy(5);
            else if (event.code === "KeyJ") seekBy(-10);
            else if (event.code === "KeyL") seekBy(10);
            else return;
            event.preventDefault();
          }}
        />
        <output className={styles.seekPreview} aria-hidden="true">{formatTime(displayedPosition)}</output>
        <div className={styles.progressTimes}>
          <span>{formatTime(displayedPosition)}</span>
          <span>{formatTime(radio.duration)}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles da rádio">
        <button type="button" className={`${styles.modeButton} ${styles.shuffleButton}`} onClick={radio.reshuffle} disabled={!canPlay || radio.tracks.length < 2} aria-label="Sortear outra música">
          <RadioIcon name="dice" />
        </button>
        <button type="button" className={styles.modeButton} onClick={radio.toggleRepeatOne} disabled={!canPlay} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa" title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}>
          <RadioIcon name="repeat" />
        </button>
        <button type="button" onClick={radio.previous} disabled={!canPlay} aria-keyshortcuts="P" aria-label="Faixa anterior">
          <RadioIcon name="previous" />
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={radio.toggle}
          disabled={!canPlay}
          data-playback-state={radio.status}
          aria-keyshortcuts="Space K"
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <RadioIcon name={playing || pending ? "pause" : "play"} />
        </button>
        <button type="button" onClick={radio.next} disabled={!canPlay || !radio.canSkipNext} aria-keyshortcuts="N" aria-label="Próxima faixa">
          <RadioIcon name="next" />
        </button>
        <VolumeControl disabled={!canPlay} triggerClassName={styles.volumeTrigger} />
        <button type="button" className={styles.modeButton} disabled aria-label="Favoritos indisponíveis nesta prévia" title="Favoritos em breve">
          <RadioIcon name="heart" />
        </button>
      </div>

      <RadioVisualizer className={styles.visualizer} active />

      <div className={styles.listHeading}>
        <h2>Playlist</h2>
        {!mobile || mobilePanel === "playlist" ? (
          <label className={styles.searchField}>
            <span className={styles.searchLabel}>Buscar na playlist</span>
            <RadioIcon name="search" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar na playlist..."
            />
          </label>
        ) : null}
        {mobile ? (
          <button
            type="button"
            className={styles.panelToggle}
            onClick={() => setMobilePanel((panel) => panel === "playlist" ? "lyrics" : "playlist")}
            aria-label={mobilePanel === "playlist" ? "Expandir letra" : "Expandir playlist"}
          >
            {mobilePanel === "playlist" ? "Letra ↓" : "↑"}
          </button>
        ) : null}
      </div>
      <ol className={styles.list} aria-label="Músicas da playlist" ref={listRef}>
        {playlist.map(({ item, position }) => (
          <li key={item.id} data-track-id={item.id}>
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
              <span className={styles.index}>{String(position).padStart(2, "0")}</span>
              <span className={styles.duration}>
                {formatDuration(
                  item.durationSeconds ?? (item.id === track?.id ? radio.duration : undefined)
                )}
              </span>
            </button>
          </li>
        ))}
        {playlist.length === 0 ? (
          <li className={styles.empty}>{normalizedQuery ? "Nenhuma música encontrada." : "A playlist está vazia."}</li>
        ) : null}
      </ol>

      <div className={styles.lyrics}>
        <RadioLyrics
          trackId={track?.id}
          title={track?.title}
          headingId={mobile ? "mobile-radio-lyrics-title" : "radio-lyrics-title"}
          active={!mobile || mobilePanel === "lyrics"}
          onClose={mobile ? () => setMobilePanel("playlist") : undefined}
        />
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
