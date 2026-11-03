/** Stable 03c Web Animations geometry, shared by dock and restore.
 * The shell still controls state, interruption, cancellation, focus and timers.
 * This module only builds the existing motion, without owning playback. */
export const RADIO_DOCK_FLIGHT_MS = 660;
const RADIO_DOCK_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

export type RadioDockFlightRect = Pick<DOMRect, "left" | "top" | "width" | "height">;

/** The extra rightward space accounts for the Studio-owned navbar lane
 * being narrower than the viewport when the Radio is docked. */
export function getRadioDockFlightKeyframes(
  from: RadioDockFlightRect,
  destination: RadioDockFlightRect,
  rightRemaining: number,
  docking: boolean
): Keyframe[] {
  return [
    {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      borderRadius: docking ? "0px" : "12px",
      opacity: 0.98
    },
    {
      left: `${destination.left + rightRemaining}px`,
      top: `${destination.top}px`,
      width: `${destination.width}px`,
      height: `${destination.height}px`,
      borderRadius: docking ? "12px" : "0px",
      opacity: 0.96
    }
  ];
}

export function getRadioDockNavShift(previousLeft: number, nextLeft: number): number | null {
  const delta = previousLeft - nextLeft;
  return Math.abs(delta) > 1 ? delta : null;
}

/** Start the unchanged WAAPI sequence; no React state or audio nodes here. */
export function startRadioDockWaapi({
  nav,
  navFrom,
  flight,
  from,
  destination,
  header,
  docking
}: {
  nav: HTMLElement | null;
  navFrom: DOMRect | null;
  flight: HTMLDivElement;
  from: RadioDockFlightRect;
  destination: RadioDockFlightRect;
  header: HTMLElement | null;
  docking: boolean;
}): { navAnimation: Animation | null; flightAnimation: Animation } {
  let navAnimation: Animation | null = null;
  if (nav && navFrom) {
    const shift = getRadioDockNavShift(navFrom.left, nav.getBoundingClientRect().left);
    if (shift !== null) {
      navAnimation = nav.animate(
        [{ transform: `translateX(${shift}px)` }, { transform: "translateX(0)" }],
        { duration: RADIO_DOCK_FLIGHT_MS, easing: RADIO_DOCK_EASING }
      );
    }
  }

  const rightRemaining = docking && header
    ? Math.max(0, window.innerWidth - header.getBoundingClientRect().right)
    : 0;
  flight.style.display = "block";
  flight.style.visibility = "visible";

  const flightAnimation = flight.animate(
    getRadioDockFlightKeyframes(from, destination, rightRemaining, docking),
    {
      duration: RADIO_DOCK_FLIGHT_MS,
      easing: RADIO_DOCK_EASING,
      fill: "forwards"
    }
  );
  return { navAnimation, flightAnimation };
}
