"use client";

import Image from "next/image";
import { type Ref } from "react";
import styles from "./radio-dock-flight.module.css";

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
