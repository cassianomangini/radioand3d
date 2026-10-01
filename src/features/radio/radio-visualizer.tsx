"use client";

import { useEffect, useRef } from "react";
import { frequencyBarHeights } from "./frequency-bars";
import { useRadio } from "./radio-provider";

const BAR_COUNT = 36;

export function RadioVisualizer({ className }: { className: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { status, analyserReady, getAnalyser } = useRadio();

  useEffect(() => {
    const root = rootRef.current;
    const analyser = getAnalyser();
    if (!root || !analyser || status !== "playing") return;

    const bars = Array.from(root.querySelectorAll<HTMLSpanElement>("span"));
    const levels = new Uint8Array(analyser.frequencyBinCount);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;

    function draw() {
      if (!analyser) return;
      analyser.getByteFrequencyData(levels);
      const heights = frequencyBarHeights(levels, analyser.context.sampleRate, bars.length);
      bars.forEach((bar, index) => { bar.style.height = `${heights[index]}%`; });
      frame = window.requestAnimationFrame(draw);
    }

    function reconcile() {
      window.cancelAnimationFrame(frame);
      if (visible && !document.hidden && !motion.matches) {
        frame = window.requestAnimationFrame(draw);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", reconcile);
    motion.addEventListener("change", reconcile);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      motion.removeEventListener("change", reconcile);
      window.cancelAnimationFrame(frame);
      bars.forEach((bar) => { bar.style.height = "4%"; });
    };
  }, [analyserReady, getAnalyser, status]);

  return (
    <div
      ref={rootRef}
      className={className}
      role="img"
      aria-label={status === "playing" ? "Visualizador reagindo ao áudio" : "Visualizador em espera"}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => <span key={index} style={{ height: "4%" }} />)}
    </div>
  );
}
