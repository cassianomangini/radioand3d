"use client";

import {
  useEffect, useRef, useState,
  type Dispatch, type SetStateAction, type RefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import {
  getMinRadioWidth, clampRadioWidth, getDefaultWidth, getExpandedWidth
} from "./radio-panel-layout";
import {
  createRadioSnapPoints, getRadioDragMagnet, getRadioDragPreview,
  getRadioDockIntent, getRadioReleaseTarget, type RadioSnapKind
} from "./radio-panel-drag";
import type { RadioLayoutMode } from "./radio-motion-spine";

type MotionDirection = "opening" | "closing";
type RadioDividerOptions = {
  shellRef: RefObject<HTMLDivElement | null>;
  radioWidth: number | null;
  radioExpanded: boolean;
  radioFullscreen: boolean;
  radioLayoutMode: RadioLayoutMode;
  setRadioWidth: Dispatch<SetStateAction<number | null>>;
  setRadioExpanded: Dispatch<SetStateAction<boolean>>;
  runRadioMotion: (direction: MotionDirection, update: () => void) => void;
  cancelRadioMotionForDirectManipulation: () => void;
  openRadioFullscreen: (fromDrag: boolean) => void;
  closeRadioFullscreen: (restoreFocus?: boolean) => void;
  runRadioDockTransition: (
    nextDocked: boolean,
    restoreWidth?: number,
    restoreMode?: RadioLayoutMode
  ) => void;
};

/** Owns divider gesture/keyboard session, snap/preview and settling.
 * The shell continues to own fullscreen/dock transitions and the single audio provider.
 * Extraction intentionally retains the original pointer and keyboard algorithms. */
export function useRadioDivider({
  shellRef, radioWidth, radioExpanded, radioFullscreen, radioLayoutMode,
  setRadioWidth, setRadioExpanded, runRadioMotion,
  cancelRadioMotionForDirectManipulation, openRadioFullscreen,
  closeRadioFullscreen, runRadioDockTransition
}: RadioDividerOptions) {
  const resizeHandleRef = useRef<HTMLDivElement>(null);
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
  const dividerSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showResizeHint, setShowResizeHint] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dividerSettling, setDividerSettling] = useState(false);

  useEffect(() => () => {
    if (dividerSettleTimerRef.current !== null) clearTimeout(dividerSettleTimerRef.current);
    if (previewResetFrameRef.current !== null) cancelAnimationFrame(previewResetFrameRef.current);
  }, []);

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

  return {
    resizeHandleRef, customWidthRef, initialRadioWidthRef, initialRadioLayoutModeRef,
    dragFullscreenRef, openedFromDragRef, showResizeHint, setShowResizeHint,
    dragging, dividerSettling, clearDragPreview, clearReturnPreview,
    handlePointerDown, handlePointerMove, stopDragging, handleResizeKeyDown
  };
}
