/** Radio fullscreen FLIP measurements and animations.
 * The shell owns transition state, cancellation, timers and playback.
 * Preserve original 03b/C1 movement, especially when interrupted. */

export type RadioFlipSnapshot = Map<string, DOMRect>;

const RADIO_FLIP_TIMING: Record<string, { open: [number, number]; close: [number, number] }> = {
  header: { open: [0, 480], close: [80, 420] },
  cover: { open: [20, 720], close: [60, 620] },
  progress: { open: [55, 560], close: [45, 500] },
  visualizer: { open: [70, 680], close: [35, 560] },
  "control-shuffle": { open: [95, 520], close: [30, 460] },
  "control-repeat": { open: [105, 520], close: [25, 460] },
  "control-previous": { open: [115, 540], close: [20, 480] },
  "control-play": { open: [125, 580], close: [15, 500] },
  "control-next": { open: [115, 540], close: [20, 480] },
  "control-volume": { open: [105, 520], close: [25, 460] },
  "control-favorite": { open: [95, 520], close: [30, 460] },
  "queue-header": { open: [110, 560], close: [0, 440] },
  "queue-list": { open: [125, 640], close: [0, 520] }
};

export function collectRadioFlipSnapshot(panel: HTMLElement): RadioFlipSnapshot {
  const snapshot: RadioFlipSnapshot = new Map();

  panel
    .querySelectorAll<HTMLElement>("[data-radio-motion-key], [data-radio-flip-key]")
    .forEach((element) => {
      const key = element.dataset.radioFlipKey ?? element.dataset.radioMotionKey;
      if (!key || key === "transport") return;
      snapshot.set(key, element.getBoundingClientRect());
    });

  return snapshot;
}

export function animateRadioFlip(
  panel: HTMLElement,
  before: RadioFlipSnapshot,
  direction: "opening" | "closing"
) {
  const animations: Animation[] = [];

  panel
    .querySelectorAll<HTMLElement>("[data-radio-motion-key], [data-radio-flip-key]")
    .forEach((element) => {
      const key = element.dataset.radioFlipKey ?? element.dataset.radioMotionKey;
      if (!key || key === "transport") return;

      const previous = before.get(key);
      if (!previous) return;

      const next = element.getBoundingClientRect();
      if (!next.width || !next.height) return;

      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      const sx = Math.max(0.62, Math.min(1.65, previous.width / next.width));
      const sy = Math.max(0.62, Math.min(1.65, previous.height / next.height));
      const moved =
        Math.hypot(dx, dy) > 1.5 ||
        Math.abs(1 - sx) > 0.015 ||
        Math.abs(1 - sy) > 0.015;

      if (!moved) return;

      const [delay, duration] =
        RADIO_FLIP_TIMING[key]?.[direction === "opening" ? "open" : "close"] ??
        (direction === "opening" ? [180, 760] : [80, 640]);

      const animation = element.animate(
        [
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            transformOrigin: "0 0"
          },
          {
            transform: "translate3d(0, 0, 0) scale(1, 1)",
            transformOrigin: "0 0"
          }
        ],
        {
          duration,
          delay,
          easing:
            direction === "opening"
              ? "cubic-bezier(0.16, 1, 0.3, 1)"
              : "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "both"
        }
      );
      animation.id = `cm-radio-layout-${key}`;

      animation.finished
        .catch(() => undefined)
        .finally(() => animation.cancel());
      animations.push(animation);
    });

  return animations;
}
