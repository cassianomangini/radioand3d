"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { flushSync } from "react-dom";
import { useReducedMotion } from "motion/react";
import styles from "./studio-radio-shell.module.css";
import headerStyles from "./site-header.module.css";
import sharedAudioStyles from "./radio-audio-controls.module.css";
import {
  getMinRadioWidth,
  getMaxRadioWidth,
  clampRadioWidth,
  getDefaultWidth,
  getExpandedWidth
} from "./radio-panel-layout";
import { StudioWelcome } from "./studio-welcome";
import { StudioHub } from "./studio-hub";
import { StudioHomeArt } from "./studio-home-art";
import { Icon, RadioContent, previewTrack, type TrackStepKind } from "./radio-content";
import type { DocumentWithViewTransition } from "./radio-view-transition";
import { SiteHeader } from "./site-header";
import { RadioDockFlight, RadioDockRestoreEdge } from "./radio-dock-flight";
import { RADIO_DOCK_FLIGHT_MS, startRadioDockWaapi } from "./radio-dock-flight-motion";
import { collectRadioFlipSnapshot, animateRadioFlip } from "./radio-flip-motion";
import { useMobileRadioDialog } from "./use-mobile-radio-dialog";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";
import { resolveRadioKeyboardCommand } from "@/features/radio/radio-keyboard";
import {
  createRadioSnapPoints,
  getRadioDragMagnet,
  getRadioDragPreview,
  getRadioDockIntent,
  getRadioReleaseTarget,
  type RadioSnapKind
} from "./radio-panel-drag";
import {
  resolveRadioLayoutMode,
  type RadioLayoutMode
} from "./radio-motion-spine";


type StudioRouteMotion = "entering" | "exiting" | null;

type TrackStepMotionState = {
  kind: TrackStepKind;
  phase: "source" | "destination";
};

function shouldIgnoreRadioShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (
    target.closest(
      'input, textarea, select, button, a[href], [contenteditable="true"], [role="slider"]'
    )
  ) {
    return true;
  }
  return target !== document.body && target.tabIndex >= 0;
}

export function StudioRadioShell({ children }: { children?: ReactNode }) {
  const radio = useRadio();
  const reduceStudioMotion = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const studioRoute = pathname.startsWith("/studio") ? "detail" : "home";
  const studioHub = pathname === "/studio";
  const studioNestedRoute = studioRoute === "detail" && !studioHub;
  const shellRef = useRef<HTMLDivElement>(null);
  const radioNavRef = useRef<HTMLAnchorElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const dockMiniRef = useRef<HTMLDivElement>(null);
  const dockFlightRef = useRef<HTMLDivElement>(null);
  const dockAnimationRef = useRef<Animation | null>(null);
  const dockNavAnimationRef = useRef<Animation | null>(null);
  const dockFlightFrameRef = useRef<number | null>(null);
  const dockMotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockMotionTokenRef = useRef(0);
  const dockedRef = useRef(false);
  const dockRestoreWidthRef = useRef(0);
  const dockRestoreModeRef = useRef<RadioLayoutMode>("split");
  const customWidthRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragLastTimeRef = useRef(0);
  const dragPointerVelocityRef = useRef(0);
  const dragStartDistanceRef = useRef(0);
  const dragOriginRef = useRef<"sidebar" | "fullscreen">("sidebar");
  const initialRadioWidthRef = useRef(0);
  const initialRadioLayoutModeRef = useRef<RadioLayoutMode>("split");
  const pointerActiveRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const dragFullscreenRef = useRef(false);
  const dragRestoredRef = useRef(false);
  const returnDistanceRef = useRef(0);
  const returnOffsetRef = useRef(0);
  const openedFromDragRef = useRef(false);
  const previewResetFrameRef = useRef<number | null>(null);
  const motionResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRadioAnimationsRef = useRef<Animation[]>([]);
  const radioMotionTokenRef = useRef(0);
  const signatureStageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dividerSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [radioWidth, setRadioWidth] = useState<number | null>(null);
  const [shellWidth, setShellWidth] = useState<number | null>(null);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const [radioExpanded, setRadioExpanded] = useState(false);
  const [showResizeHint, setShowResizeHint] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [radioFullscreen, setRadioFullscreen] = useState(false);
  const [radioDocked, setRadioDocked] = useState(false);
  const [radioDockMotion, setRadioDockMotion] = useState<"docking" | "restoring" | null>(null);
  const [layoutMotionDirection, setLayoutMotionDirection] = useState<"opening" | "closing" | null>(null);
  const [dividerSettling, setDividerSettling] = useState(false);
  const [miniVolumeOpen, setMiniVolumeOpen] = useState(false);
  const { mobileDialogRef, miniOpenButtonRef, mobileRadioOpen, setMobileRadioOpen,
    miniMotionEndpoint, dialogMotionEndpoint, openMobileRadio, closeMobileRadio
  } = useMobileRadioDialog({ onBeforeTransition: () => setMiniVolumeOpen(false) });
  const [trackStepMotion, setTrackStepMotion] = useState<TrackStepMotionState | null>(null);
  const [studioRouteMotion, setStudioRouteMotion] = useState<StudioRouteMotion>(null);
  const [studioIntroCycle, setStudioIntroCycle] = useState(0);
  const miniVolumeMenuRef = useRef<HTMLDivElement>(null);
  const miniVolumeButtonRef = useRef<HTMLButtonElement>(null);
  const trackStepMotionTokenRef = useRef(0);
  const routeTransitionActiveRef = useRef(false);
  const routeMotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shellStyle = useMemo(
    () =>
      (radioWidth === null
        ? {}
        : { "--radio-width": `${radioWidth}px` }) as CSSProperties,
    [radioWidth]
  );

  const radioLayoutMode = useMemo(
    () =>
      resolveRadioLayoutMode({
        fullscreen: radioFullscreen,
        docked: radioDocked,
        expanded: radioExpanded,
        width: radioWidth,
        defaultWidth: shellWidth === null ? null : getDefaultWidth(shellWidth)
      }),
    [radioDocked, radioExpanded, radioFullscreen, radioWidth, shellWidth]
  );

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/studio");
  }, [router]);

  useEffect(() => {
    if (!pathname.startsWith("/musica/") || !window.matchMedia("(max-width: 73.74rem)").matches) return;
    const timer = window.setTimeout(() => setMobileRadioOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, setMobileRadioOpen]);

  useEffect(() => {
    if (studioRoute !== "home") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setStudioIntroCycle((cycle) => cycle + 1);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [studioRoute]);

  useEffect(() => () => {
    if (routeMotionTimerRef.current !== null) {
      clearTimeout(routeMotionTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!miniVolumeOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!miniVolumeMenuRef.current?.contains(event.target as Node)) setMiniVolumeOpen(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMiniVolumeOpen(false);
      miniVolumeButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [miniVolumeOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 73.74rem)");
    function leaveDesktop() {
      if (media.matches) {
        cancelDockFlight();
        dockedRef.current = false;
        setRadioDocked(false);
        setRadioDockMotion(null);
        setRadioFullscreen(false);
        setRadioExpanded(false);
      }
    }
    media.addEventListener("change", leaveDesktop);
    return () => media.removeEventListener("change", leaveDesktop);
  }, []);

  useEffect(() => () => {
    radioMotionTokenRef.current += 1;
    if (motionResetTimerRef.current !== null) clearTimeout(motionResetTimerRef.current);
    if (signatureStageTimerRef.current !== null) clearTimeout(signatureStageTimerRef.current);
    for (const animation of activeRadioAnimationsRef.current) animation.cancel();
    activeRadioAnimationsRef.current = [];
    if (dividerSettleTimerRef.current !== null) clearTimeout(dividerSettleTimerRef.current);
    cancelDockFlight();
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = shell.getBoundingClientRect().width;
      setShellWidth(width);
      setDesktopLayout(window.matchMedia("(min-width: 73.75rem)").matches);
      setRadioWidth((current) =>
        dockedRef.current
          ? current
          : radioExpanded
          ? getExpandedWidth(width)
          : customWidthRef.current
            ? clampRadioWidth(width, current ?? getDefaultWidth(width))
            : getDefaultWidth(width)
      );
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [radioExpanded]);

  function updateRadioWidth(requested: number) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const next = clampRadioWidth(shell.getBoundingClientRect().width, requested);
    setRadioWidth(next);
  }

  function toggleRadioExpanded() {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const shellWidth = shell.getBoundingClientRect().width;
    customWidthRef.current = false;

    if (radioExpanded) {
      runRadioMotion("closing", () => {
        setRadioWidth(getDefaultWidth(shellWidth));
        setRadioExpanded(false);
        setShowResizeHint(false);
      });
      return;
    }

    runRadioMotion("opening", () => {
      setRadioWidth(getExpandedWidth(shellWidth));
      setRadioExpanded(true);
      setShowResizeHint(true);
    });
  }

  function clearDragPreview() {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.removeProperty("--radio-preview-width");
    delete shell.dataset.radioPreview;
  }

  function setDividerMagnet(snap: RadioSnapKind | null) {
    const shell = shellRef.current;
    if (!shell) return;
    if (snap) shell.dataset.radioMagnet = snap;
    else delete shell.dataset.radioMagnet;
  }

  function settleDivider(targetWidth: number, snap: RadioSnapKind | null) {
    if (!snap) return;

    const nextFocused = snap === "focus";
    const applySettle = () => {
      if (dividerSettleTimerRef.current !== null) {
        clearTimeout(dividerSettleTimerRef.current);
      }

      setDividerSettling(true);
      customWidthRef.current = snap === "compact";
      setRadioExpanded(nextFocused);
      setRadioWidth(targetWidth);

      dividerSettleTimerRef.current = setTimeout(() => {
        setDividerSettling(false);
        dividerSettleTimerRef.current = null;
      }, 460);
    };

    if (nextFocused !== radioExpanded) {
      runRadioMotion(nextFocused ? "opening" : "closing", applySettle);
      return;
    }

    applySettle();
  }

  function clearReturnPreview() {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.removeProperty("--radio-return-offset");
    delete shell.dataset.radioReturning;
    returnOffsetRef.current = 0;
  }

  function runTrackStepMotion(kind: TrackStepKind, action: () => void) {
    if (mobileMotionActiveRef.current) {
      action();
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;
    if (reduce || !documentWithTransition.startViewTransition) {
      action();
      return;
    }

    const token = ++trackStepMotionTokenRef.current;
    let updated = false;

    flushSync(() => {
      setTrackStepMotion({ kind, phase: "source" });
    });

    try {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          updated = true;
          action();
          setTrackStepMotion({ kind, phase: "destination" });
        });
      });

      void transition.finished.finally(() => {
        if (trackStepMotionTokenRef.current === token) {
          setTrackStepMotion(null);
        }
      });
    } catch {
      if (trackStepMotionTokenRef.current === token) {
        setTrackStepMotion(null);
      }
      if (!updated) action();
    }
  }

  function previousTrack() {
    if (radio.position > 3 || !radio.hasPrevious) {
      radio.previous();
      return;
    }
    runTrackStepMotion("previous", radio.previous);
  }

  function nextTrack() {
    runTrackStepMotion("next", radio.next);
  }

  const handleRadioShortcut = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (shouldIgnoreRadioShortcutTarget(event.target)) return;

    const command = resolveRadioKeyboardCommand(event);
    if (!command || !radio.currentTrack) return;
    if (command.type === "next" && !radio.canSkipNext) return;

    event.preventDefault();

    switch (command.type) {
      case "toggle":
        radio.toggle();
        break;
      case "seek":
        radio.seek(radio.position + command.seconds);
        break;
      case "mute":
        radio.toggleMute();
        break;
      case "previous":
        previousTrack();
        break;
      case "next":
        nextTrack();
        break;
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleRadioShortcut);
    return () => window.removeEventListener("keydown", handleRadioShortcut);
  }, []);

  function clearSignatureStageTimer() {
    if (signatureStageTimerRef.current !== null) {
      clearTimeout(signatureStageTimerRef.current);
      signatureStageTimerRef.current = null;
    }
  }

  function cancelRadioMotionForDirectManipulation() {
    radioMotionTokenRef.current += 1;
    clearSignatureStageTimer();
    if (motionResetTimerRef.current !== null) {
      clearTimeout(motionResetTimerRef.current);
      motionResetTimerRef.current = null;
    }
    for (const animation of activeRadioAnimationsRef.current) {
      animation.cancel();
    }
    activeRadioAnimationsRef.current = [];
    setLayoutMotionDirection(null);
  }

  function runRadioMotion(direction: "opening" | "closing", update: () => void) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const token = ++radioMotionTokenRef.current;

    if (motionResetTimerRef.current !== null) {
      clearTimeout(motionResetTimerRef.current);
      motionResetTimerRef.current = null;
    }

    const panel = shellRef.current?.querySelector<HTMLElement>("#radio");
    // Measure before cancelling the previous WAAPI set so an interruption starts
    // from the geometry the user is actually seeing in this frame.
    const before = !reduce && panel ? collectRadioFlipSnapshot(panel) : null;

    for (const animation of activeRadioAnimationsRef.current) {
      animation.cancel();
    }
    activeRadioAnimationsRef.current = [];

    const clearMotionState = () => {
      if (radioMotionTokenRef.current !== token) return;
      setLayoutMotionDirection(null);
      motionResetTimerRef.current = null;
      activeRadioAnimationsRef.current = [];
    };

    flushSync(() => {
      setLayoutMotionDirection(reduce ? null : direction);
      update();
    });

    if (reduce || !panel || !before) {
      clearMotionState();
      return;
    }

    const animations = animateRadioFlip(panel, before, direction);
    activeRadioAnimationsRef.current = animations;
    const totalDuration = direction === "opening" ? 900 : 760;

    if (animations.length === 0) {
      motionResetTimerRef.current = setTimeout(clearMotionState, totalDuration);
      return;
    }

    void Promise.allSettled(animations.map((animation) => animation.finished)).finally(
      clearMotionState
    );
    motionResetTimerRef.current = setTimeout(clearMotionState, totalDuration + 80);
  }

  function cancelDockFlight() {
    ++dockMotionTokenRef.current;
    if (dockFlightFrameRef.current !== null) {
      cancelAnimationFrame(dockFlightFrameRef.current);
      dockFlightFrameRef.current = null;
    }
    if (dockMotionTimerRef.current !== null) {
      clearTimeout(dockMotionTimerRef.current);
      dockMotionTimerRef.current = null;
    }
    dockAnimationRef.current?.cancel();
    dockNavAnimationRef.current?.cancel();
    dockAnimationRef.current = null;
    dockNavAnimationRef.current = null;
    if (dockFlightRef.current) {
      dockFlightRef.current.style.display = "none";
      dockFlightRef.current.style.visibility = "hidden";
    }
  }

  /** The only owner of the sidebar-to-navbar transformation.
   * Measure the existing surface before updating React, then fly a single
   * artwork surface to its target while the real Studio and header reflow.
   * React never remounts the player provider or fabricates audio.
   */
  function runRadioDockTransition(nextDocked: boolean, restoreWidth?: number, restoreMode?: RadioLayoutMode, fromFullscreen = false) {
    const shell = shellRef.current;
    const mini = dockMiniRef.current;
    const flight = dockFlightRef.current;
    const panel = shell?.querySelector<HTMLElement>("#radio");
    if (!shell || !mini || !flight || !panel) return;
    if (!window.matchMedia("(min-width: 73.75rem)").matches) return;
    if (radioFullscreen && !fromFullscreen) return;
    if (dockedRef.current === nextDocked && dockAnimationRef.current === null) return;

    const header = shell.closest(`.${styles.site}`)?.querySelector<HTMLElement>(`.${headerStyles.siteHeader}`);
    const nav = header?.querySelector<HTMLElement>(`.${headerStyles.desktopNav}`);
    const navFrom = nav?.getBoundingClientRect() ?? null;
    const currentlyFlying = flight.style.display === "block" && dockAnimationRef.current !== null;
    const from = currentlyFlying
      ? flight.getBoundingClientRect()
      : (nextDocked ? panel : mini).getBoundingClientRect();

    if (nextDocked && !dockedRef.current) {
      dockRestoreWidthRef.current = restoreWidth ?? radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width);
      dockRestoreModeRef.current = restoreMode && restoreMode !== "docked" && restoreMode !== "fullscreen"
        ? restoreMode
        : radioLayoutMode === "docked" || radioLayoutMode === "fullscreen" ? "split" : radioLayoutMode;
    }

    cancelDockFlight();
    const token = dockMotionTokenRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dockedRef.current = nextDocked;

    flushSync(() => {
      setRadioDocked(nextDocked);
      setRadioDockMotion(reduce ? null : nextDocked ? "docking" : "restoring");
      if (nextDocked) {
        setRadioFullscreen(false);
        setRadioExpanded(false);
        setShowResizeHint(false);
      } else {
        const width = clampRadioWidth(shell.getBoundingClientRect().width, dockRestoreWidthRef.current);
        customWidthRef.current = dockRestoreModeRef.current === "custom";
        setRadioWidth(width);
        setRadioExpanded(dockRestoreModeRef.current === "focus");
      }
    });

    if (reduce) {
      if (!nextDocked) requestAnimationFrame(() => resizeHandleRef.current?.focus());
      return;
    }

    const complete = () => {
      if (dockMotionTokenRef.current !== token) return;
      if (dockMotionTimerRef.current !== null) {
        clearTimeout(dockMotionTimerRef.current);
        dockMotionTimerRef.current = null;
      }
      dockAnimationRef.current?.cancel();
      dockNavAnimationRef.current?.cancel();
      dockAnimationRef.current = null;
      dockNavAnimationRef.current = null;
      flight.style.display = "none";
      flight.style.visibility = "hidden";
      setRadioDockMotion(null);
      if (!nextDocked) requestAnimationFrame(() => resizeHandleRef.current?.focus());
    };

    // Two frames allow a CSS grid transition to establish the destination
    // without reading an outdated dock position from the previous layout.
    dockFlightFrameRef.current = requestAnimationFrame(() => {
      dockFlightFrameRef.current = requestAnimationFrame(() => {
        dockFlightFrameRef.current = null;
        if (dockMotionTokenRef.current !== token) return;
        const destination = (nextDocked ? mini : panel).getBoundingClientRect();
        if (!destination.width || !destination.height || !from.width || !from.height) {
          complete();
          return;
        }

        const { navAnimation, flightAnimation } = startRadioDockWaapi({
          nav: nav ?? null, navFrom, flight, from, destination, header: header ?? null, docking: nextDocked
        });
        if (navAnimation) {
          dockNavAnimationRef.current = navAnimation;
          void navAnimation.finished.catch(() => undefined);
        }
        dockAnimationRef.current = flightAnimation;
        void flightAnimation.finished.then(complete).catch(() => undefined);
        dockMotionTimerRef.current = setTimeout(complete, RADIO_DOCK_FLIGHT_MS + 150);
      });
    });
  }

  function openRadioFullscreen(fromDrag: boolean) {
    if (!fromDrag && (radioFullscreen || signatureStageTimerRef.current !== null)) {
      return;
    }

    const shell = shellRef.current;
    const shellWidth = shell?.getBoundingClientRect().width;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wasDocked = dockedRef.current;

    clearSignatureStageTimer();
    if (wasDocked) {
      cancelDockFlight();
      dockedRef.current = false;
    }

    if (!fromDrag) {
      initialRadioWidthRef.current = wasDocked
        ? dockRestoreWidthRef.current
        : radioWidth ?? getDefaultWidth(shellWidth ?? window.innerWidth);
      initialRadioLayoutModeRef.current = wasDocked ? "docked" : radioLayoutMode;
    }

    openedFromDragRef.current = fromDrag;
    dragFullscreenRef.current = true;

    const enterFullscreen = () => {
      signatureStageTimerRef.current = null;
      runRadioMotion("opening", () => {
        clearDragPreview();
        setShowResizeHint(false);
        setRadioDocked(false);
        setRadioDockMotion(null);
        setRadioFullscreen(true);
      });
    };

    if (
      !reduce &&
      !fromDrag &&
      !radioExpanded &&
      !radioFullscreen &&
      !wasDocked &&
      shellWidth
    ) {
      customWidthRef.current = false;
      runRadioMotion("opening", () => {
        setRadioWidth(getExpandedWidth(shellWidth));
        setRadioExpanded(true);
        setShowResizeHint(false);
      });

      signatureStageTimerRef.current = setTimeout(enterFullscreen, 190);
      return;
    }

    enterFullscreen();
  }

  function restoreMediumFromPocket() {
    const shell = shellRef.current;
    if (!shell || !dockedRef.current) return;
    dockRestoreWidthRef.current = getDefaultWidth(shell.getBoundingClientRect().width);
    dockRestoreModeRef.current = "split";
    runRadioDockTransition(false);
  }

  function dockRadio() {
    if (radioFullscreen) {
      const shell = shellRef.current;
      const width = getDefaultWidth(shell?.getBoundingClientRect().width ?? window.innerWidth);
      runRadioDockTransition(true, width, "split", true);
      return;
    }
    runRadioDockTransition(true);
  }

  function showMediumRadio() {
    const shell = shellRef.current;
    if (!shell) return;
    clearSignatureStageTimer();
    const width = getDefaultWidth(shell.getBoundingClientRect().width);
    runRadioMotion("closing", () => {
      clearDragPreview();
      clearReturnPreview();
      dragFullscreenRef.current = false;
      openedFromDragRef.current = false;
      customWidthRef.current = false;
      dockedRef.current = false;
      initialRadioWidthRef.current = width;
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(width);
      setRadioDocked(false);
      setRadioDockMotion(null);
      setRadioExpanded(false);
      setRadioFullscreen(false);
    });
  }

  function closeRadioFullscreen(restoreFocus = true) {
    clearSignatureStageTimer();
    const returnMode = initialRadioLayoutModeRef.current;
    runRadioMotion("closing", () => {
      clearDragPreview();
      dragFullscreenRef.current = false;
      customWidthRef.current = returnMode === "custom" || (returnMode === "docked" && dockRestoreModeRef.current === "custom");
      dockedRef.current = returnMode === "docked";
      setRadioWidth(initialRadioWidthRef.current);
      setRadioDocked(returnMode === "docked");
      setRadioDockMotion(null);
      setRadioExpanded(returnMode === "focus");
      setRadioFullscreen(false);
      clearReturnPreview();
    });
    if (restoreFocus) {
      requestAnimationFrame(() => {
        (returnMode === "docked"
          ? dockMiniRef.current?.querySelector<HTMLButtonElement>('[data-dock-restore="true"]')
          : openedFromDragRef.current ? resizeHandleRef.current : radioNavRef.current)?.focus();
      });
    }
  }

  function restoreInitialRadioLayout() {
    // Navigation within the Studio does not unexpectedly reopen the sidebar.
    if (dockedRef.current && !radioFullscreen) return;
    if (radioFullscreen && initialRadioLayoutModeRef.current === "docked") {
      closeRadioFullscreen(false);
      return;
    }
    clearSignatureStageTimer();
    const shellWidth = shellRef.current?.getBoundingClientRect().width;
    const initialWidth = getDefaultWidth(shellWidth ?? window.innerWidth);

    if (
      !radioFullscreen &&
      !radioExpanded &&
      !customWidthRef.current &&
      (radioWidth === null || radioWidth === initialWidth)
    ) {
      return;
    }

    runRadioMotion("closing", () => {
      clearDragPreview();
      clearReturnPreview();
      dragFullscreenRef.current = false;
      openedFromDragRef.current = false;
      customWidthRef.current = false;
      initialRadioWidthRef.current = initialWidth;
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(initialWidth);
      setRadioExpanded(false);
      setRadioFullscreen(false);
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerActiveRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (previewResetFrameRef.current !== null) cancelAnimationFrame(previewResetFrameRef.current);
    previewResetFrameRef.current = null;
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    cancelRadioMotionForDirectManipulation();

    const rect = shell.getBoundingClientRect();
    dragOriginRef.current = radioFullscreen ? "fullscreen" : "sidebar";
    if (!radioFullscreen) {
      initialRadioWidthRef.current = radioWidth ?? getDefaultWidth(rect.width);
      initialRadioLayoutModeRef.current = radioLayoutMode;
    }
    dragFullscreenRef.current = radioFullscreen;
    dragRestoredRef.current = false;
    dragOffsetRef.current = rect.right - event.clientX - initialRadioWidthRef.current;
    dragStartXRef.current = event.clientX;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;
    dragPointerVelocityRef.current = 0;
    dragStartDistanceRef.current = event.clientX - rect.left;
    returnDistanceRef.current = Math.max(0, rect.width - initialRadioWidthRef.current - event.currentTarget.getBoundingClientRect().width);
    pointerActiveRef.current = true;
    pointerMovedRef.current = false;
    setShowResizeHint(!radioFullscreen);
    clearDragPreview();
    clearReturnPreview();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerActiveRef.current || Math.abs(event.clientX - dragStartXRef.current) < 4) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    pointerMovedRef.current = true;

    const elapsed = Math.max(8, event.timeStamp - dragLastTimeRef.current);
    const instantPointerVelocity = (event.clientX - dragLastXRef.current) / elapsed;
    dragPointerVelocityRef.current =
      dragPointerVelocityRef.current * 0.56 + instantPointerVelocity * 0.44;
    dragLastXRef.current = event.clientX;
    dragLastTimeRef.current = event.timeStamp;

    if (dragOriginRef.current === "fullscreen") {
      const distance = Math.min(returnDistanceRef.current, Math.max(0, event.clientX - dragStartXRef.current));
      returnOffsetRef.current = distance;
      if (distance > 0) {
        shell.style.setProperty("--radio-return-offset", `${distance}px`);
        shell.dataset.radioReturning = "true";
      } else {
        clearReturnPreview();
      }
      if (distance >= returnDistanceRef.current) {
        pointerActiveRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
        closeRadioFullscreen(false);
      }
      return;
    }

    const requested = rect.right - event.clientX - dragOffsetRef.current;
    const minimumWidth = getMinRadioWidth(rect.width);
    const dockIntent = getRadioDockIntent(requested, minimumWidth);
    if (dockIntent.ready) shell.dataset.radioDockReady = "true";
    else delete shell.dataset.radioDockReady;
    const maximum = clampRadioWidth(rect.width, Number.POSITIVE_INFINITY);
    const pointerDistance = event.clientX - rect.left;
    const preview = getRadioDragPreview(rect.width, maximum, requested, pointerDistance, dragStartDistanceRef.current);

    if (dragFullscreenRef.current) {
      if (pointerDistance > dragStartDistanceRef.current / 2 + 48) {
        dragRestoredRef.current = true;
        closeRadioFullscreen(false);
      }
      return;
    }

    if (dragRestoredRef.current) {
      if (preview.ready) {
        dragRestoredRef.current = false;
        openRadioFullscreen(true);
      }
      return;
    }

    const clampedRequested = clampRadioWidth(rect.width, requested);
    const snapPoints = createRadioSnapPoints(
      minimumWidth,
      getDefaultWidth(rect.width),
      getExpandedWidth(rect.width)
    );
    const magnet = getRadioDragMagnet(clampedRequested, snapPoints);

    customWidthRef.current = true;
    updateRadioWidth(magnet.width);
    setDividerMagnet(magnet.snap);
    setRadioExpanded(false);
    if (preview.ready) {
      openRadioFullscreen(true);
      return;
    }
    if (preview.width > 0) {
      shell.style.setProperty("--radio-preview-width", `${preview.width}px`);
      shell.dataset.radioPreview = "true";
    } else {
      clearDragPreview();
    }
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!pointerActiveRef.current) return;
    const shouldRestore = event.type === "pointercancel" && dragOriginRef.current === "sidebar" && dragFullscreenRef.current;
    const shouldReturn = event.type === "pointerup" && dragOriginRef.current === "fullscreen" && returnOffsetRef.current >= returnDistanceRef.current / 2;
    const shouldSettle =
      event.type === "pointerup" &&
      pointerMovedRef.current &&
      dragOriginRef.current === "sidebar" &&
      !dragFullscreenRef.current &&
      !dragRestoredRef.current;
    const shellAtRelease = shellRef.current;
    const releaseWidth = shellAtRelease?.getBoundingClientRect().width ?? window.innerWidth;
    const releaseMinimum = getMinRadioWidth(releaseWidth);
    const requestedAtRelease = shellAtRelease
      ? shellAtRelease.getBoundingClientRect().right - event.clientX - dragOffsetRef.current
      : releaseMinimum;
    const shouldDock = shouldSettle && getRadioDockIntent(requestedAtRelease, releaseMinimum).ready;

    pointerActiveRef.current = false;
    setDragging(false);
    setShowResizeHint(false);

    if (shouldRestore || shouldReturn) {
      closeRadioFullscreen(false);
    } else if (shouldDock) {
      runRadioDockTransition(true, initialRadioWidthRef.current, initialRadioLayoutModeRef.current);
    } else if (event.type === "pointercancel" && dragOriginRef.current === "sidebar" && !dragFullscreenRef.current) {
      // A cancelled pointer is not an implicit dock, nor a committed resize.
      customWidthRef.current = initialRadioLayoutModeRef.current === "custom";
      setRadioWidth(initialRadioWidthRef.current);
      setRadioExpanded(initialRadioLayoutModeRef.current === "focus");
    } else if (shouldSettle) {
      const shell = shellRef.current;
      if (shell) {
        const rect = shell.getBoundingClientRect();
        const releasedWidth = clampRadioWidth(
          rect.width,
          rect.right - event.clientX - dragOffsetRef.current
        );
        const snapPoints = createRadioSnapPoints(
          getMinRadioWidth(rect.width),
          getDefaultWidth(rect.width),
          getExpandedWidth(rect.width)
        );
        const target = getRadioReleaseTarget(
          releasedWidth,
          -dragPointerVelocityRef.current,
          snapPoints
        );
        settleDivider(target.width, target.snap);
      }
    }

    setDividerMagnet(null);
    if (shellAtRelease) delete shellAtRelease.dataset.radioDockReady;
    previewResetFrameRef.current = requestAnimationFrame(() => {
      clearDragPreview();
      clearReturnPreview();
      previewResetFrameRef.current = null;
    });
  }

  function handleResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (radioFullscreen) {
      if (["Enter", " ", "Escape", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        closeRadioFullscreen();
      }
      return;
    }
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const step = event.shiftKey ? 48 : 16;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleRadioExpanded();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth((radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width)) + step);
      setRadioExpanded(false);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const shellWidth = shell.getBoundingClientRect().width;
      const width = radioWidth ?? getDefaultWidth(shellWidth);
      if (width <= getMinRadioWidth(shellWidth) + 1) {
        runRadioDockTransition(true, width, radioLayoutMode);
      } else {
        customWidthRef.current = true;
        updateRadioWidth(width - step);
        setRadioExpanded(false);
      }
    }

    if (event.key === "Home") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth(getMinRadioWidth(shell.getBoundingClientRect().width));
      setRadioExpanded(false);
    }

    if (event.key === "End") {
      event.preventDefault();
      customWidthRef.current = false;
      const shellWidth = shell.getBoundingClientRect().width;
      runRadioMotion("opening", () => {
        setRadioWidth(getExpandedWidth(shellWidth));
        setRadioExpanded(true);
      });
    }
  }

  function navigateStudioRoute(href: "/" | "/studio") {
    restoreInitialRadioLayout();
    if (pathname === href || routeTransitionActiveRef.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      router.push(href);
      return;
    }

    if (routeMotionTimerRef.current !== null) {
      clearTimeout(routeMotionTimerRef.current);
      routeMotionTimerRef.current = null;
    }

    const direction: StudioRouteMotion = href === "/studio" ? "entering" : "exiting";
    routeTransitionActiveRef.current = true;

    flushSync(() => {
      setStudioRouteMotion(direction);
    });

    requestAnimationFrame(() => {
      router.push(href);
    });

    routeMotionTimerRef.current = setTimeout(() => {
      setStudioRouteMotion(null);
      routeTransitionActiveRef.current = false;
      routeMotionTimerRef.current = null;
    }, 1280);
  }

  function handleStudioRouteLink(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: "/" | "/studio"
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateStudioRoute(href);
  }

  const radioAtMaximumWidth =
    desktopLayout &&
    shellWidth !== null &&
    radioWidth !== null &&
    radioWidth >= clampRadioWidth(shellWidth, Number.POSITIVE_INFINITY) - 1;

  const activeNav =
    radioFullscreen || radioExpanded || mobileRadioOpen || radioAtMaximumWidth
      ? "radio"
      : studioRoute === "detail"
        ? "studio"
        : "home";

  const playbackStatusMessage =
    radio.status === "loading"
      ? "Carregando áudio."
      : radio.status === "buffering"
        ? "Aguardando dados de áudio."
        : radio.status === "playing"
          ? "Reprodução iniciada."
          : radio.status === "paused"
            ? "Reprodução pausada."
            : "";

  return (
    <div id="top" className={styles.site} style={shellStyle} data-radio-layout-mode={radioLayoutMode} data-radio-docked={radioDocked ? "true" : undefined} data-radio-dock-motion={radioDockMotion ?? undefined} data-radio-expanded={radioExpanded ? "true" : undefined} data-radio-wider-than-default={shellWidth !== null && radioWidth !== null && radioWidth > getDefaultWidth(shellWidth) ? "true" : undefined} data-radio-dragging={dragging ? "true" : undefined} data-radio-fullscreen={radioFullscreen ? "true" : undefined} data-radio-layout-motion={layoutMotionDirection ?? undefined} data-radio-divider-settling={dividerSettling ? "true" : undefined}>
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {playbackStatusMessage}
      </span>
      <SiteHeader
        activeNav={activeNav}
        radioNavRef={radioNavRef}
        dockMiniRef={dockMiniRef}
        radioDocked={radioDocked}
        radioDockMotion={radioDockMotion}
        radioFullscreen={radioFullscreen}
        onNavigate={handleStudioRouteLink}
        onPrefetchStudio={() => router.prefetch("/studio")}
        onOpenRadioFullscreen={() => openRadioFullscreen(false)}
        onOpenMobileRadio={openMobileRadio}
        onRestoreDock={() => runRadioDockTransition(false)}
      />

      <div
        className={styles.mobileMiniPlayer}
        role="region"
        aria-label="Mini player da CM Rádio"
        data-track-step={!mobileRadioOpen ? trackStepMotion?.kind : undefined}
        data-mobile-motion-endpoint={miniMotionEndpoint ? "true" : undefined}
      >
        <span className={styles.miniCover}><Image src={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="64px" unoptimized /></span>
        <span className={styles.miniMeta}>
          <strong>{radio.currentTrack?.title ?? previewTrack.title}</strong>
          <small>{radio.currentTrack?.artist ?? previewTrack.artist}</small>
        </span>
        <button
          ref={miniOpenButtonRef}
          type="button"
          className={styles.miniOpen}
          onClick={openMobileRadio}
          aria-label="Abrir rádio completa"
        >
          <Icon name="expand" />
          <span>Rádio</span>
        </button>
        <div className={styles.miniSignal}>
          <RadioVisualizer className={`${sharedAudioStyles.visualizer} ${styles.miniVisualizer}`} barCount={24} active={!mobileRadioOpen} />
        </div>
        <div className={styles.miniControls}>
          <button type="button" className={styles.miniStep} onClick={radio.reshuffle} disabled={radio.tracks.length < 2} aria-label="Embaralhar e trocar de música" title="Embaralhar e trocar de música"><Icon name="shuffle" /></button>
          <button type="button" className={styles.miniStep} onClick={radio.toggleRepeatOne} disabled={!radio.currentTrack} aria-pressed={radio.repeatOne} aria-label="Repetir esta faixa" title={radio.repeatOne ? "Desligar repetição da faixa" : "Repetir esta faixa"}><Icon name="repeat" /></button>
          <button type="button" className={styles.miniStep} onClick={previousTrack} disabled={!radio.currentTrack} aria-keyshortcuts="P" aria-label="Faixa anterior"><Icon name="previous" /></button>
          <button
            type="button"
            className={styles.miniPlay}
            onClick={radio.toggle}
            disabled={!radio.currentTrack}
            data-playback-state={radio.status}
            aria-busy={radio.status === "loading" || radio.status === "buffering"}
            aria-keyshortcuts="Space K"
            aria-label={radio.status === "loading" || radio.status === "buffering" ? "Cancelar reprodução" : radio.status === "playing" ? "Pausar" : "Tocar"}
          >
            <Icon name={radio.status === "playing" || radio.status === "loading" || radio.status === "buffering" ? "pause" : "play"} />
          </button>
          <button type="button" className={styles.miniStep} onClick={nextTrack} disabled={!radio.currentTrack || !radio.canSkipNext} aria-keyshortcuts="N" aria-label="Próxima faixa"><Icon name="next" /></button>
          <div
            ref={miniVolumeMenuRef}
            className={sharedAudioStyles.volumeMenu}
            data-radio-volume-menu="pocket"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setMiniVolumeOpen(false);
            }}
          >
            <button
              ref={miniVolumeButtonRef}
              type="button"
              className={`${styles.miniStep} ${sharedAudioStyles.volumeTrigger}`}
              onClick={() => setMiniVolumeOpen((open) => !open)}
              disabled={!radio.currentTrack}
              aria-label={`Volume ${Math.round(radio.volume * 100)}%. ${miniVolumeOpen ? "Fechar" : "Abrir"} controle`}
              aria-expanded={miniVolumeOpen}
              aria-controls={miniVolumeOpen ? "mini-radio-volume" : undefined}
            >
              <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
            </button>
            {miniVolumeOpen ? (
              <div id="mini-radio-volume" className={sharedAudioStyles.volumePopover} data-radio-volume-popover="pocket" role="group" aria-label="Controle de volume">
                <button type="button" className={sharedAudioStyles.muteButton} onClick={radio.toggleMute} aria-label={radio.volume === 0 ? "Ativar som" : "Silenciar"}>
                  <Icon name={radio.volume === 0 ? "volumeMute" : "volume"} />
                </button>
                <input
                className={sharedAudioStyles.volumeSlider}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={radio.volume}
                onChange={(event) => radio.setVolume(Number(event.target.value))}
                aria-label="Volume"
                aria-valuetext={`${Math.round(radio.volume * 100)}%`}
                style={{ "--volume-level": `${Math.round(radio.volume * 100)}%` } as CSSProperties}
              />
                <span className={sharedAudioStyles.volumeLevel}>{Math.round(radio.volume * 100)}%</span>
              </div>
            ) : null}
          </div>
          <button type="button" className={styles.miniStep} disabled aria-label="Favoritos indisponíveis nesta prévia"><Icon name="heart" /></button>
        </div>
        <span className={styles.miniProgress} aria-hidden="true">
          <span style={{ width: radio.duration > 0 ? `${radio.position / radio.duration * 100}%` : "0%" }} />
        </span>
      </div>

      <div
        ref={shellRef}
        className={styles.desktopShell}
        role="region"
        aria-label="Estúdio e Rádio"
        data-dragging={dragging ? "true" : undefined}
      >
        <main
          id="studio"
          className={styles.studio}
          data-studio-route={studioRoute}
          data-studio-transition={studioRouteMotion ?? undefined}
          inert={radioFullscreen}
        >
          <div className={styles.studioMachine} aria-hidden="true" />
          <div className={styles.studioStageShade} aria-hidden="true" />

          {studioRoute === "home" ? <StudioHomeArt /> : null}

          <div
            className={styles.studioCatalogHeader}
            aria-hidden={!studioHub}
          >
            <h1>ESTÚDIO DE IMPRESSÃO 3D</h1>
            <span>PROJETOS PERSONALIZADOS, PEÇAS PRODUZIDAS E PRODUTOS PRONTOS.</span>
          </div>

          <StudioWelcome
            route={studioRoute}
            introCycle={studioIntroCycle}
            onNavigate={handleStudioRouteLink}
            onPrefetchStudio={() => router.prefetch("/studio")}
          />

          <StudioHub
            active={studioHub}
            radioFullscreen={radioFullscreen}
            reducedMotion={Boolean(reduceStudioMotion)}
          />

          {studioNestedRoute ? (
            <div className={styles.studioRouteContent} data-studio-route-content="true">{children}</div>
          ) : null}
        </main>

        <div
          ref={resizeHandleRef}
          className={styles.resizeHandle}
          data-resize-hint={showResizeHint && !radioFullscreen ? "true" : undefined}
          role={radioFullscreen ? "button" : "separator"}
          aria-label={radioFullscreen ? "Restaurar o Estúdio" : "Arraste para redimensionar CM Rádio"}
          aria-orientation={radioFullscreen ? undefined : "vertical"}
          aria-valuemin={radioFullscreen || shellWidth === null ? undefined : getMinRadioWidth(shellWidth)}
          aria-valuemax={radioFullscreen || shellWidth === null ? undefined : Math.round(getMaxRadioWidth(shellWidth))}
          aria-valuenow={radioFullscreen || shellWidth === null ? undefined : Math.round(clampRadioWidth(shellWidth, radioWidth ?? getDefaultWidth(shellWidth)))}
          aria-controls={radioFullscreen ? undefined : "radio"}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={handleResizeKeyDown}
          title={radioFullscreen ? "Arraste para a direita para mostrar o Estúdio" : "Arraste para ajustar livremente a largura da CM Rádio"}
        />

        <aside id="radio" className={styles.radioPanel} data-radio-flip-root="true" aria-label="CM Rádio" inert={radioDocked} aria-hidden={radioDocked}>
          <RadioContent
            focus={radioExpanded && !radioFullscreen}
            visualizerActive={!radioDocked}
            expanded={radioFullscreen}
            trackStepKind={trackStepMotion?.kind}
            onPrevious={previousTrack}
            onNext={nextTrack}
            onReshuffle={radio.reshuffle}
            onDock={dockRadio}
            onExpand={() => openRadioFullscreen(false)}
            onMedium={showMediumRadio}
          />
        </aside>
      </div>

      <RadioDockFlight
        flightRef={dockFlightRef}
        artwork={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"}
        title={radio.currentTrack?.title ?? "CM Rádio"}
        artist={radio.currentTrack?.artist ?? "Aguardando catálogo"}
      />

      {radioDocked ? <RadioDockRestoreEdge onRestore={restoreMediumFromPocket} /> : null}

      <dialog
        ref={mobileDialogRef}
        className={styles.mobileDialog}
        data-mobile-motion-endpoint={dialogMotionEndpoint ? "true" : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeMobileRadio();
        }}
        onClose={() => setMobileRadioOpen(false)}
        aria-label="CM Rádio completa"
      >
        <RadioContent
          mobile
          mobileMotionEndpoint={dialogMotionEndpoint}
          trackStepKind={trackStepMotion?.kind}
          onPrevious={previousTrack}
          onNext={nextTrack}
          onReshuffle={radio.reshuffle}
          onClose={closeMobileRadio}
        />
      </dialog>
    </div>
  );
}
