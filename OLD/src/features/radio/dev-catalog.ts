import type { RadioTrack } from "./radio-provider";

// Synthetic audio exists only to exercise the local player and queue.
export function getDevRadioTracks(): RadioTrack[] {
  if (process.env.NODE_ENV !== "development") return [];

  return Array.from({ length: 12 }, (_, index) => ({
    id: `dev-audio-${index + 1}`,
    title: `Amostra técnica ${String(index + 1).padStart(2, "0")}`,
    artist: "Áudio sintético · desenvolvimento",
    src: `/dev/audio-fixture?track=${index + 1}`,
    artwork: "/images/cm-radio-preview-art.png",
    durationSeconds: 8,
    fixture: true
  }));
}
