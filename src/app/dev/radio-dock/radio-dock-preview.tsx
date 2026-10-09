"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadio } from "@/features/radio/radio-provider";
import { StudioRadioShell } from "@/components/studio-radio/studio-radio-shell";
import shellStyles from "@/components/studio-radio/studio-radio-shell.module.css";
import styles from "./radio-dock-preview.module.css";

type PreviewPhase = "side" | "docking" | "docked" | "restoring";
const DOCK_THRESHOLD_PX = 96;
const RESTORE_THRESHOLD_PX = 78;
const MIN_SIDEBAR_WIDTH_PX = 400;
const FLIGHT_DURATION_MS = 660;
const FALLBACK_COVER = "/images/cm-radio-preview-art.png";

function PlayGlyph({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  );
}

function ExpandGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M9 4H4v5M15 20h5v-5M4 4l7 7m9 9-7-7" />
    </svg>
  );
}

/**
 * Only mounted on /dev/radio-dock. The *real* production shell, artwork, header
 * and RadioProvider are rendered below. The companion adds a reversible motion
 * proof without changing StudioRadioShell or its approved state machine.
 */
export function RadioDockPreview() {
  const radio = useRadio();
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const activeAnimationRef = useRef<Animation | null>(null);
  const motionTokenRef = useRef(0);
  const phaseRef = useRef<PreviewPhase>("side");
  const [phase, setPhase] = useState<PreviewPhase>("side");
  const [ready, setReady] = useState(false);
  const [socialTarget, setSocialTarget] = useState<Element | null>(null);
  const cover = radio.currentTrack?.artwork ?? FALLBACK_COVER;
  const title = radio.currentTrack?.title ?? "CM Rádio";
  const artist = radio.currentTrack?.artist ?? "Aguardando catálogo";
  const playing = radio.status === "playing";

  function commitPhase(next: PreviewPhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const social = root.querySelector(`.${shellStyles.socialIcons}`);
    if (!social) return;

    // Attribute hooks point to REAL hashed CSS-module nodes. Targeting their
    // source class names as :global(.siteHeader) would not match the DOM.
    const targets = [
      [shellStyles.siteHeader, "data-preview-header"],
      [shellStyles.desktopShell, "data-preview-shell"],
      [shellStyles.radioPanel, "data-preview-radio"],
      [shellStyles.resizeHandle, "data-preview-divider"],
      [shellStyles.socialIcons, "data-preview-socials"]
    ] as const;
    const marked = targets.flatMap(([className, attribute]) => {
      const element = root.querySelector(`.${className}`);
      if (!element) return [];
      element.setAttribute(attribute, "true");
      return [{ element, attribute }];
    });

    setSocialTarget(social);
    setReady(true);
    root.dataset.previewReady = "true";
    return () => {
      delete root.dataset.previewReady;
      for (const { element, attribute } of marked) element.removeAttribute(attribute);
    };
  }, []);

  useEffect(() => () => {
    motionTokenRef.current += 1;
    activeAnimationRef.current?.cancel();
  }, []);

  const transition = useCallback((destination: "docked" | "side") => {
    const root = rootRef.current;
    const slot = dockRef.current;
    const flight = flightRef.current;
    if (!root || !slot || !flight) return;
    if (destination === "docked" && phaseRef.current !== "side") return;
    if (destination === "side" && phaseRef.current !== "docked") return;

    const aside = root.querySelector(`.${shellStyles.radioPanel}`);
    if (!(aside instanceof HTMLElement)) return;
    const from = destination === "docked" ? aside.getBoundingClientRect() : slot.getBoundingClientRect();
    const token = ++motionTokenRef.current;
    activeAnimationRef.current?.cancel();

    commitPhase(destination === "docked" ? "docking" : "restoring");

    // Let the actual shell reflow before measuring the destination. This
    // is a visual proof; final implementation will extend the native FLIP spine.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== motionTokenRef.current) return;
      const targetElement = destination === "docked" ? dockRef.current : aside;
      if (!targetElement) return;
      const to = targetElement.getBoundingClientRect();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced || !from.width || !to.width) {
        flight.style.visibility = "hidden";
        commitPhase(destination);
        return;
      }

      // On dock the current header shifts right as Studio expands.
      // Account for its remaining movement to land in the final navbar slot.
      if (destination === "docked") {
        const header = root.querySelector(`.${shellStyles.siteHeader}`);
        if (header instanceof HTMLElement) {
          const headerRect = header.getBoundingClientRect();
          const remainingRight = Math.max(0, window.innerWidth - headerRect.right);
          to.x += remainingRight;
        }
      }

      flight.style.visibility = "visible";
      flight.style.display = "block";
      const start = {
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        borderRadius: destination === "docked" ? "0px" : "12px",
        opacity: "0.98"
      };
      const end = {
        left: `${to.left}px`,
        top: `${to.top}px`,
        width: `${to.width}px`,
        height: `${to.height}px`,
        borderRadius: destination === "docked" ? "12px" : "0px",
        opacity: "0.96"
      };
      const anim = flight.animate([start, end], {
        duration: FLIGHT_DURATION_MS,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      });
      activeAnimationRef.current = anim;
      void anim.finished.then(() => {
        if (token !== motionTokenRef.current) return;
        anim.cancel();
        activeAnimationRef.current = null;
        flight.style.visibility = "hidden";
        flight.style.display = "none";
        commitPhase(destination);
      }).catch(() => {
        // Cancellation intentionally discards an interrupted flight.
      });
    }));
  }, []);

  useEffect(() => {
    if (!ready || phase !== "side") return;
    const root = rootRef.current;
    const handle = root?.querySelector(`.${shellStyles.resizeHandle}`);
    const aside = root?.querySelector(`.${shellStyles.radioPanel}`);
    if (!(handle instanceof HTMLElement) || !(aside instanceof HTMLElement)) return;

    let gesture: { id: number; startX: number; requiredX: number } | null = null;

    function onStart(event: PointerEvent) {
      if (event.button !== 0 || !handle?.contains(event.target as Node)) return;
      const sidebarWidth = aside?.getBoundingClientRect().width ?? MIN_SIDEBAR_WIDTH_PX;
      gesture = {
        id: event.pointerId,
        startX: event.clientX,
        requiredX: Math.max(0, sidebarWidth - MIN_SIDEBAR_WIDTH_PX) + DOCK_THRESHOLD_PX
      };
    }
    function onEnd(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const distance = event.clientX - gesture.startX;
      const requested = gesture.requiredX;
      gesture = null;
      if (distance >= requested) transition("docked");
    }
    function onCancel() { gesture = null; }

    root?.addEventListener("pointerdown", onStart, true);
    window.addEventListener("pointerup", onEnd, true);
    window.addEventListener("pointercancel", onCancel, true);
    return () => {
      root?.removeEventListener("pointerdown", onStart, true);
      window.removeEventListener("pointerup", onEnd, true);
      window.removeEventListener("pointercancel", onCancel, true);
    };
  }, [ready, phase, transition]);

  const edgeOriginRef = useRef<{ id: number; startX: number } | null>(null);
  function edgeDown(event: React.PointerEvent<HTMLButtonElement>) {
    edgeOriginRef.current = { id: event.pointerId, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function edgeUp(event: React.PointerEvent<HTMLButtonElement>) {
    const original = edgeOriginRef.current;
    edgeOriginRef.current = null;
    if (original?.id === event.pointerId && original.startX - event.clientX >= RESTORE_THRESHOLD_PX) {
      transition("side");
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.preview}
      data-radio-dock-preview="true"
      data-dock-phase={phase}
      data-mock-approved="false"
    >
      <StudioRadioShell />

      {socialTarget ? createPortal(
        <div className={styles.dockSlot} ref={dockRef} data-dock-mini="true" aria-hidden={phase !== "docked" ? true : undefined} inert={phase !== "docked"}>
          <Image src={cover} width={36} height={36} unoptimized alt="" className={styles.dockCover} />
          <span className={styles.dockCopy}>
            <strong title={title}>{title}</strong>
            <small>{artist}</small>
          </span>
          <button
            type="button"
            onClick={radio.toggle}
            disabled={!radio.currentTrack}
            aria-label={playing ? "Pausar CM Rádio" : "Tocar CM Rádio"}
            title={playing ? "Pausar" : "Tocar"}
            className={styles.dockControl}
          >
            <PlayGlyph playing={playing} />
          </button>
          <button
            type="button"
            onClick={() => transition("side")}
            title="Restaurar a Rádio lateral"
            aria-label="Restaurar a Rádio lateral"
            className={styles.dockRestore}
            data-dock-restore="true"
          >
            <ExpandGlyph />
          </button>
        </div>,
        socialTarget
      ) : null}

      <div className={styles.flight} ref={flightRef} aria-hidden="true" data-dock-flight="true">
        <Image src={cover} fill sizes="(max-width: 480px) 100vw, 480px" unoptimized alt="" className={styles.flightArtwork} />
        <span className={styles.flightCaption}>
          <strong>{title}</strong>
          <small>{artist}</small>
        </span>
      </div>

      {phase === "docked" ? (
        <button
          type="button"
          className={styles.edgeHandle}
          aria-label="Arraste para a esquerda para restaurar a Rádio lateral"
          title="Arraste para restaurar a Rádio"
          onPointerDown={edgeDown}
          onPointerUp={edgeUp}
          onPointerCancel={() => { edgeOriginRef.current = null; }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowLeft") {
              event.preventDefault();
              transition("side");
            }
          }}
          data-dock-edge="true"
        />
      ) : null}

      <aside className={styles.previewGuide} aria-label="Controles da prévia, apenas desenvolvimento">
        <span className={styles.previewKicker}>03C · PRÉVIA INTERATIVA</span>
        <strong>{phase === "docked" ? "Rádio no cabeçalho" : phase === "docking" ? "Rádio subindo" : phase === "restoring" ? "Rádio retornando" : "Rádio lateral"}</strong>
        <p>{phase === "docked"
          ? "Restaure pelo botão ao lado da faixa ou arraste a borda direita para a esquerda."
          : "Arraste a divisória para a direita além do mínimo ou teste a transição pelo botão."}</p>
        <button
          type="button"
          disabled={phase === "docking" || phase === "restoring"}
          onClick={() => transition(phase === "docked" ? "side" : "docked")}
          data-dock-demo-toggle="true"
        >
          {phase === "docked" ? "Restaurar lateral" : "Recolher na navbar"}
          <span aria-hidden="true">↗</span>
        </button>
        <small>Prova de movimento, sem alteração do layout público.</small>
      </aside>

      <span className={styles.srOnly} role="status" aria-live="polite">
        {phase === "docked" ? "Rádio recolhida na barra superior." :
          phase === "side" ? "Rádio disponível na lateral." : ""}
      </span>
    </div>
  );
}
