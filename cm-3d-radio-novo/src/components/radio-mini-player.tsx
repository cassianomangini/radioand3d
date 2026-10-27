"use client";

import Image from "next/image";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { RadioIcon } from "./radio-icons";
import styles from "./radio-mini-player.module.css";

const FALLBACK_ART = "/images/cm-radio-preview-art.png";

export function RadioMiniPlayer({ onRestore }: { onRestore: () => void }) {
  const radio = useRadio();
  const track = radio.currentTrack;
  const playing = radio.status === "playing" || radio.status === "loading" || radio.status === "buffering";
  const title = track?.title ?? "CM Rádio";
  const artist = track?.artist ?? "Aguardando catálogo";

  return (
    <div className={styles.player} data-playback-state={radio.status} role="region" aria-label="Mini-player da CM Rádio">
      <span className={styles.cover}>
        <Image src={track?.artwork ?? FALLBACK_ART} alt="" width={168} height={84} unoptimized />
      </span>
      <span className={styles.copy}>
        <span className={styles.brand}>CM RÁDIO</span>
        <strong title={title}>{title}</strong>
        <small title={artist}>{artist}</small>
      </span>
      <span className={styles.transport} role="group" aria-label="Controles da rádio">
        <button type="button" onClick={radio.previous} disabled={!track} aria-keyshortcuts="P" aria-label="Faixa anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v14" /><path d="m19 5-11 7 11 7V5Z" fill="currentColor" stroke="none" /></svg>
        </button>
        <button
          type="button"
          className={styles.play}
          onClick={radio.toggle}
          disabled={!track}
          aria-keyshortcuts="Space K"
          aria-label={playing ? "Pausar" : "Tocar"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" /></svg>
          )}
        </button>
        <button type="button" onClick={radio.next} disabled={!track || !radio.canSkipNext} aria-keyshortcuts="N" aria-label="Próxima faixa">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5v14" /><path d="m5 5 11 7-11 7V5Z" fill="currentColor" stroke="none" /></svg>
        </button>
      </span>
      <RadioVisualizer className={styles.signal} barCount={13} active />
      <span className={styles.separator} aria-hidden="true" />
      <button
        type="button"
        className={styles.restore}
        data-layout-action="expand"
        onClick={onRestore}
        aria-label="Expandir a Rádio"
        title="Expandir a Rádio"
      >
        <RadioIcon name="expand" />
      </button>
    </div>
  );
}
