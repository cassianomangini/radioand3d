"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { DocumentWithViewTransition } from "./radio-view-transition";

type MobileRadioMotionState = {
  direction: "opening" | "closing";
  phase: "source" | "destination";
};

/** Owns the single native mobile <dialog>, View Transition and focus restoration.
 * The mini player and full Radio still share the same RadioProvider in the shell. */
export function useMobileRadioDialog({ onBeforeTransition }: { onBeforeTransition: () => void }) {
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const miniOpenButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileRadioOpen, setMobileRadioOpen] = useState(false);
  const [mobileRadioMotion, setMobileRadioMotion] = useState<MobileRadioMotionState | null>(null);
  const mobileMotionActiveRef = useRef(false);
  const mobileMotionTokenRef = useRef(0);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) {
      return;
    }

    if (mobileRadioOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!mobileRadioOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileRadioOpen]);

  function runMobileRadioMotion(direction: "opening" | "closing") {
    if (mobileMotionActiveRef.current) return;

    const open = direction === "opening";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;

    onBeforeTransition();

    if (reduce || !documentWithTransition.startViewTransition) {
      setMobileRadioMotion(null);
      setMobileRadioOpen(open);
      if (!open) {
        requestAnimationFrame(() => miniOpenButtonRef.current?.focus());
      }
      return;
    }

    mobileMotionActiveRef.current = true;
    const token = ++mobileMotionTokenRef.current;

    flushSync(() => {
      setMobileRadioMotion({ direction, phase: "source" });
    });

    try {
      const transition = documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          setMobileRadioOpen(open);
          setMobileRadioMotion({ direction, phase: "destination" });
        });

        const dialog = mobileDialogRef.current;
        if (open && dialog && !dialog.open) {
          dialog.showModal();
        } else if (!open && dialog?.open) {
          dialog.close();
        }
      });

      void transition.finished.finally(() => {
        if (mobileMotionTokenRef.current !== token) return;
        mobileMotionActiveRef.current = false;
        setMobileRadioMotion(null);
        if (!open) {
          requestAnimationFrame(() => miniOpenButtonRef.current?.focus());
        }
      });
    } catch {
      mobileMotionActiveRef.current = false;
      setMobileRadioMotion(null);
      setMobileRadioOpen(open);
    }
  }

  function openMobileRadio() {
    runMobileRadioMotion("opening");
  }

  function closeMobileRadio() {
    runMobileRadioMotion("closing");
  }

  const miniMotionEndpoint = Boolean(
    mobileRadioMotion &&
      (
        (mobileRadioMotion.direction === "opening" && mobileRadioMotion.phase === "source") ||
        (mobileRadioMotion.direction === "closing" && mobileRadioMotion.phase === "destination")
      )
  );
  const dialogMotionEndpoint = Boolean(
    mobileRadioMotion &&
      (
        (mobileRadioMotion.direction === "opening" && mobileRadioMotion.phase === "destination") ||
        (mobileRadioMotion.direction === "closing" && mobileRadioMotion.phase === "source")
      )
  );

  return {
    mobileDialogRef, miniOpenButtonRef,
    mobileRadioOpen, setMobileRadioOpen,
    miniMotionEndpoint, dialogMotionEndpoint,
    openMobileRadio, closeMobileRadio
  };
}
