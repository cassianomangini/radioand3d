"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { RadioIcon } from "./radio-icons";
import { VolumeControl } from "./volume-control";
import styles from "./mobile-radio-bar.module.css";

const FALLBACK_ART = "/images/cm-radio-preview-art.png";

export function MobileRadioBar({
  active,
  onOpen,
}: {
  active: boolean;
  onOpen: () => void;
}) {
  const radio = useRadio();
  const track = radio.currentTrack;
  const playing = radio.status === "playing" || radio.status === "loading" || radio.status === "buffering";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const progress = radio.duration > 0 ? Math.min(100, (radio.position / radio.duration) * 100) : 0;

  return (
    <div className={styles.bar} role="region" aria-label="Mini player da CM Rádio">
      <span className={styles.cover}>
        <Image src={track?.artwork ?? FALLBACK_ART} alt="" fill sizes="64px" unoptimized />
      </span>
      <span className={styles.meta}>
        <strong>{track?.title ?? "CM Rádio"}</strong>
        <small>{track?.artist ?? "Aguardando catálogo"}</small>
      </span>
      <button type="button" className={styles.open} onClick={onOpen} aria-label="Abrir rádio completa">
        <RadioIcon name="expand" />
      </button>
      <RadioVisualizer className={styles.signal} barCount={36} active={active} />
      <div className={styles.controls} role="group" aria-label="Controles da rádio">
        <button
          type="button"
          className={`${styles.step} ${styles.shuffle}`}
          onClick={radio.reshuffle}
          disabled={!track || radio.tracks.length < 2}
          aria-label="Sortear outra música"
          title="Sortear outra música"
        >
          <RadioIcon name="dice" />
        </button>
        <button
          type="button"
          className={styles.step}
          onClick={radio.toggleRepeatOne}
          disabled={!track}
          aria-pressed={radio.repeatOne}
          aria-label="Repetir esta faixa"
          title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}
        >
          <RadioIcon name="repeat" />
        </button>
        <button
          type="button"
          className={styles.step}
          onClick={radio.previous}
          disabled={!track}
          aria-keyshortcuts="P"
          aria-label="Faixa anterior"
        >
          <RadioIcon name="previous" />
        </button>
        <button
          type="button"
          className={styles.play}
          onClick={radio.toggle}
          disabled={!track}
          data-playback-state={radio.status}
          aria-keyshortcuts="Space K"
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <RadioIcon name={playing ? "pause" : "play"} />
        </button>
        <button
          type="button"
          className={styles.step}
          onClick={radio.next}
          disabled={!track || !radio.canSkipNext}
          aria-keyshortcuts="N"
          aria-label="Próxima faixa"
        >
          <RadioIcon name="next" />
        </button>
        <VolumeControl disabled={!track} placement="below" triggerClassName={styles.step} />
        <button
          type="button"
          className={styles.step}
          disabled
          aria-label="Favoritos indisponíveis nesta prévia"
          title="Favoritos em breve"
        >
          <RadioIcon name="heart" />
        </button>
      </div>
      <span className={styles.progress} aria-hidden="true">
        <span style={{ width: `${progress}%` } as CSSProperties} />
      </span>
    </div>
  );
}
