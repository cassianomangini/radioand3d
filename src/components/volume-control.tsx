"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useRadio } from "@/features/radio/radio-provider";
import { RadioIcon } from "./radio-icons";
import styles from "./volume-control.module.css";

export function VolumeControl({
  disabled = false,
  placement = "above",
  triggerClassName,
}: {
  disabled?: boolean;
  placement?: "above" | "below";
  triggerClassName?: string;
}) {
  const radio = useRadio();
  const panelId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const percent = Math.round(radio.volume * 100);
  const muted = radio.volume === 0;

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleEscape, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  return (
    <div className={styles.menu} ref={menuRef} data-placement={placement}>
      <button
        ref={buttonRef}
        type="button"
        className={triggerClassName ? `${styles.trigger} ${triggerClassName}` : styles.trigger}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-label={`Volume ${percent}%. ${open ? "Fechar" : "Abrir"} controle`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <RadioIcon name={muted ? "volumeMute" : "volume"} />
      </button>
      {open ? (
        <div id={panelId} className={styles.popover} role="group" aria-label="Controle de volume">
          <button
            type="button"
            className={styles.mute}
            onClick={radio.toggleMute}
            aria-label={muted ? "Ativar som" : "Silenciar"}
            title={muted ? "Ativar som" : "Silenciar"}
          >
            <RadioIcon name={muted ? "volumeMute" : "volume"} />
          </button>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={radio.volume}
            onChange={(event) => radio.setVolume(Number(event.target.value))}
            aria-label="Volume"
            aria-valuetext={`${percent}%`}
            style={{ "--volume-level": `${percent}%` } as CSSProperties}
          />
          <span className={styles.level}>{percent}%</span>
        </div>
      ) : null}
    </div>
  );
}
