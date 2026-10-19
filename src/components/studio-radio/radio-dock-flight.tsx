"use client";

import Image from "next/image";
import { useRef, type Ref } from "react";
import styles from "./radio-dock-flight.module.css";

const RADIO_DOCK_EDGE_RESTORE_PX = 78;

/** Temporary image surface that flies from the real Radio sidebar to the
 * existing navbar mini-player. Does not own playback or render another audio. */
export function RadioDockFlight({
  flightRef,
  artwork,
  title,
  artist
}: {
  flightRef: Ref<HTMLDivElement>;
  artwork: string;
  title: string;
  artist: string;
}) {
  return (
    <div ref={flightRef} className={styles.radioDockFlight} aria-hidden="true" data-radio-dock-flight="true">
      <Image
        src={artwork}
        fill
        sizes="(min-width: 1180px) 60vw, 480px"
        unoptimized
        alt=""
        className={styles.radioDockFlightArtwork}
      />
      <span className={styles.radioDockFlightCaption}>
        <strong>{title}</strong>
        <small>{artist}</small>
      </span>
    </div>
  );
}

/** The keyboard and pointer restoration affordance uses the same threshold
 * as the original shell, with pointer capture isolated to the docked surface. */
export function RadioDockRestoreEdge({ onRestore }: { onRestore: () => void }) {
  const gesture = useRef<{ pointerId: number; startX: number } | null>(null);

  return (
    <button
      type="button"
      className={styles.radioDockEdge}
      data-radio-dock-edge="true"
      aria-label="Arraste para a esquerda para voltar a Rádio ao tamanho médio"
      title="Arraste para voltar a Rádio ao tamanho médio"
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        gesture.current = { pointerId: event.pointerId, startX: event.clientX };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        const drag = gesture.current;
        gesture.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (drag?.pointerId === event.pointerId && drag.startX - event.clientX >= RADIO_DOCK_EDGE_RESTORE_PX) {
          onRestore();
        }
      }}
      onPointerCancel={() => { gesture.current = null; }}
      onKeyDown={(event) => {
        if (["Enter", " ", "ArrowLeft"].includes(event.key)) {
          event.preventDefault();
          onRestore();
        }
      }}
    />
  );
}
