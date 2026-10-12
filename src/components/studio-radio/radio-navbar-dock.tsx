"use client";

import Image from "next/image";
import type { Ref } from "react";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import styles from "./radio-navbar-dock.module.css";

function PreviousGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4h2v16H5V4Zm14 1v14l-11-7 11-7Z" /></svg>;
}

function NextGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 4h2v16h-2V4ZM5 5l11 7-11 7V5Z" /></svg>;
}

function PlayGlyph({ playing }: { playing: boolean }) {
  return playing
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>;
}

function RestoreGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M9 4H4v5M15 20h5v-5M4 4l7 7m9 9-7-7" /></svg>;
}

/** Same global playback provider as the full Radio and mobile mini.
 * This surface is visible ONLY when the desktop sidebar is docked.
 */
export function RadioNavbarDock({
  miniRef,
  visible,
  animating,
  onRestore
}: {
  miniRef: Ref<HTMLDivElement>;
  visible: boolean;
  animating: boolean;
  onRestore: () => void;
}) {
  const radio = useRadio();
  const playing = radio.status === "playing" || radio.status === "loading" || radio.status === "buffering";
  const title = radio.currentTrack?.title ?? "CM Rádio";
  const artist = radio.currentTrack?.artist ?? "Aguardando catálogo";
  const artwork = radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png";

  return (
    <div
      ref={miniRef}
      className={styles.dockMini}
      data-radio-navbar-mini="true"
      data-playback-state={radio.status}
      role="region"
      aria-label="Mini-player CM Rádio na navbar"
      aria-hidden={!visible}
      inert={!visible}
    >
      <span className={styles.dockCoverShell}>
        <Image src={artwork} width={168} height={84} unoptimized alt="" className={styles.dockCover} />
      </span>
      <span className={styles.dockCopy}>
        <span className={styles.dockBrand}>CM RÁDIO</span>
        <strong title={title} data-dock-title="true">{title}</strong>
        <small title={artist}>{artist}</small>
      </span>
      <span className={styles.dockTransport} role="group" aria-label="Controles da Rádio">
        <button type="button" className={styles.dockSkip} onClick={radio.previous} disabled={!radio.currentTrack} aria-label="Faixa anterior" aria-keyshortcuts="P" title="Faixa anterior"><PreviousGlyph /></button>
        <button
          type="button"
          className={styles.dockPlay}
          onClick={radio.toggle}
          disabled={!radio.currentTrack}
          aria-busy={radio.status === "loading" || radio.status === "buffering"}
          aria-label={radio.status === "loading" || radio.status === "buffering" ? "Cancelar reprodução" : playing ? "Pausar CM Rádio" : "Tocar CM Rádio"}
          aria-keyshortcuts="Space K"
          title={playing ? "Pausar" : "Tocar"}
        ><PlayGlyph playing={playing} /></button>
        <button type="button" className={styles.dockSkip} onClick={radio.next} disabled={!radio.currentTrack || !radio.canSkipNext} aria-label="Próxima faixa" aria-keyshortcuts="N" title="Próxima faixa"><NextGlyph /></button>
      </span>
      <div className={styles.dockSignal} data-dock-signal="true">
        <RadioVisualizer className={styles.dockSpectrum} barCount={13} active={visible && !animating} />
      </div>
      <span className={styles.dockSeparator} aria-hidden="true" />
      <button
        type="button"
        className={styles.dockRestore}
        onClick={onRestore}
        title="Restaurar a Rádio lateral"
        aria-label="Restaurar a Rádio lateral"
        data-dock-restore="true"
      ><RestoreGlyph /></button>
    </div>
  );
}
