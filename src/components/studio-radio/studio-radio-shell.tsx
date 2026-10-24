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
  type MouseEvent as ReactMouseEvent
} from "react";
import { flushSync } from "react-dom";
import { useReducedMotion } from "motion/react";
import styles from "./studio-radio-shell.module.css";
import headerStyles from "./site-header.module.css";
import sharedAudioStyles from "./radio-audio-controls.module.css";
import {
  getRouteDefaultRadioWidth
} from "./radio-panel-layout";
import { StudioWelcome } from "./studio-welcome";
import { StudioHub } from "./studio-hub";
import { StudioHomeArt } from "./studio-home-art";
import { Icon, RadioContent, previewTrack, type TrackStepKind } from "./radio-content";
import type { DocumentWithViewTransition } from "./radio-view-transition";
import { SiteHeader } from "./site-header";
import { RadioDockFlight } from "./radio-dock-flight";
import { RADIO_DOCK_FLIGHT_MS, startRadioDockWaapi } from "./radio-dock-flight-motion";
import { collectRadioFlipSnapshot, animateRadioFlip } from "./radio-flip-motion";
import { useMobileRadioDialog } from "./use-mobile-radio-dialog";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";
import { resolveRadioKeyboardCommand } from "@/features/radio/radio-keyboard";
import { moveDirectionalFocus, shouldKeepNativeArrow } from "./directional-focus";
import type { RadioLayoutMode } from "./radio-motion-spine";


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
  const dockMiniRef = useRef<HTMLDivElement>(null);
  const dockFlightRef = useRef<HTMLDivElement>(null);
  const dockAnimationRef = useRef<Animation | null>(null);
  const dockNavAnimationRef = useRef<Animation | null>(null);
  const dockFlightFrameRef = useRef<number | null>(null);
  const dockMotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockMotionTokenRef = useRef(0);
  const dockedRef = useRef(false);
  const initialRadioLayoutModeRef = useRef<RadioLayoutMode>("split");
  const motionResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRadioAnimationsRef = useRef<Animation[]>([]);
  const radioMotionTokenRef = useRef(0);
  const [radioWidth, setRadioWidth] = useState<number | null>(null);
  const [radioFullscreen, setRadioFullscreen] = useState(false);
  const [radioDocked, setRadioDocked] = useState(false);
  const [radioDockMotion, setRadioDockMotion] = useState<"docking" | "restoring" | null>(null);
  const [layoutMotionDirection, setLayoutMotionDirection] = useState<"opening" | "closing" | null>(null);
  const [miniVolumeOpen, setMiniVolumeOpen] = useState(false);
  const { mobileDialogRef, miniOpenButtonRef, mobileMotionActiveRef, mobileRadioOpen, setMobileRadioOpen,
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

  const radioLayoutMode: RadioLayoutMode = radioFullscreen ? "fullscreen" : radioDocked ? "docked" : "split";

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
      }
    }
    media.addEventListener("change", leaveDesktop);
    return () => media.removeEventListener("change", leaveDesktop);
  }, []);

  useEffect(() => () => {
    radioMotionTokenRef.current += 1;
    if (motionResetTimerRef.current !== null) clearTimeout(motionResetTimerRef.current);
    for (const animation of activeRadioAnimationsRef.current) animation.cancel();
    activeRadioAnimationsRef.current = [];
    cancelDockFlight();
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = shell.getBoundingClientRect().width;
      setRadioWidth((current) =>
        dockedRef.current
          ? current
          : getRouteDefaultRadioWidth(width, studioRoute)
      );
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [studioRoute]);

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
    // The remote uses these keys to move focus; a focused range handles seeking itself.
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") return;
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

  useEffect(() => {
    function handleDirectionalFocus(event: globalThis.KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (
        event.key !== "ArrowLeft" && event.key !== "ArrowRight" &&
        event.key !== "ArrowUp" && event.key !== "ArrowDown"
      ) return;
      if (shouldKeepNativeArrow(event.target, event.key)) return;
      const root = document.querySelector<HTMLDialogElement>("dialog[open]") ??
        document.getElementById("top");
      if (!root || !moveDirectionalFocus(root, event.key)) return;
      event.preventDefault();
    }
    window.addEventListener("keydown", handleDirectionalFocus);
    return () => window.removeEventListener("keydown", handleDirectionalFocus);
  }, []);

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
  function runRadioDockTransition(nextDocked: boolean, fromFullscreen = false) {
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

    cancelDockFlight();
    const token = dockMotionTokenRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dockedRef.current = nextDocked;

    flushSync(() => {
      setRadioDocked(nextDocked);
      setRadioDockMotion(reduce ? null : nextDocked ? "docking" : "restoring");
      if (nextDocked) {
        setRadioFullscreen(false);
      } else {
        const shellWidth = shell.getBoundingClientRect().width;
        setRadioWidth(getRouteDefaultRadioWidth(shellWidth, studioRoute));
      }
    });

    if (reduce) {
      if (!nextDocked) requestAnimationFrame(() => radioNavRef.current?.focus());
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
      if (!nextDocked) requestAnimationFrame(() => radioNavRef.current?.focus());
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

  function openRadioFullscreen() {
    if (radioFullscreen) return;
    const wasDocked = dockedRef.current;

    if (wasDocked) {
      cancelDockFlight();
      dockedRef.current = false;
    }

    initialRadioLayoutModeRef.current = wasDocked ? "docked" : "split";
    runRadioMotion("opening", () => {
      setRadioDocked(false);
      setRadioDockMotion(null);
      setRadioFullscreen(true);
    });
  }

  function dockRadio() {
    if (radioFullscreen) {
      runRadioDockTransition(true, true);
      return;
    }
    runRadioDockTransition(true);
  }

  function showMediumRadio() {
    const shell = shellRef.current;
    if (!shell) return;
    const width = getRouteDefaultRadioWidth(shell.getBoundingClientRect().width, studioRoute);
    runRadioMotion("closing", () => {
      dockedRef.current = false;
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(width);
      setRadioDocked(false);
      setRadioDockMotion(null);
      setRadioFullscreen(false);
    });
  }

  function closeRadioFullscreen(restoreFocus = true) {
    const returnMode = initialRadioLayoutModeRef.current;
    runRadioMotion("closing", () => {
      dockedRef.current = returnMode === "docked";
      setRadioWidth(getRouteDefaultRadioWidth(shellRef.current?.getBoundingClientRect().width ?? window.innerWidth, studioRoute));
      setRadioDocked(returnMode === "docked");
      setRadioDockMotion(null);
      setRadioFullscreen(false);
    });
    if (restoreFocus) {
      requestAnimationFrame(() => {
        (returnMode === "docked"
          ? dockMiniRef.current?.querySelector<HTMLButtonElement>('[data-dock-restore="true"]')
          : radioNavRef.current)?.focus();
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
    const shellWidth = shellRef.current?.getBoundingClientRect().width;
    const initialWidth = getRouteDefaultRadioWidth(shellWidth ?? window.innerWidth, studioRoute);

    if (
      !radioFullscreen &&
      (radioWidth === null || radioWidth === initialWidth)
    ) {
      return;
    }

    runRadioMotion("closing", () => {
      initialRadioLayoutModeRef.current = "split";
      setRadioWidth(initialWidth);
      setRadioFullscreen(false);
    });
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

  const activeNav =
    radioFullscreen || mobileRadioOpen
      ? "radio"
      : pathname === "/studio/orcamento"
        ? "quote"
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
    <div id="top" className={styles.site} style={shellStyle} data-radio-layout-mode={radioLayoutMode} data-radio-docked={radioDocked ? "true" : undefined} data-radio-dock-motion={radioDockMotion ?? undefined} data-radio-fullscreen={radioFullscreen ? "true" : undefined} data-radio-layout-motion={layoutMotionDirection ?? undefined}>
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
        onOpenRadioFullscreen={openRadioFullscreen}
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
        </button>
        <div className={styles.miniSignal}>
          <RadioVisualizer className={`${sharedAudioStyles.visualizer} ${styles.miniVisualizer}`} barCount={36} active={!mobileRadioOpen} />
        </div>
        <div className={styles.miniControls}>
          <button type="button" className={styles.miniStep} onClick={radio.reshuffle} disabled={radio.tracks.length < 2} aria-label="Sortear outra música" title="Sortear outra música"><Icon name="dice" /></button>
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
            <span>ESTÚDIO DE IMPRESSÃO 3D</span>
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

        <div className={styles.resizeHandle} aria-hidden="true" />

        <aside id="radio" className={styles.radioPanel} data-radio-flip-root="true" aria-label="CM Rádio" inert={radioDocked} aria-hidden={radioDocked}>
          <RadioContent
            visualizerActive={!radioDocked}
            expanded={radioFullscreen}
            trackStepKind={trackStepMotion?.kind}
            onPrevious={previousTrack}
            onNext={nextTrack}
            onReshuffle={radio.reshuffle}
            onDock={dockRadio}
            onExpand={openRadioFullscreen}
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
