"use client";

import { useEffect, useRef } from "react";
import { frequencyBarHeights } from "./frequency-bars";
import { useRadio } from "./radio-provider";

const BAR_COUNT = 36;

export function RadioVisualizer({ className }: { className: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { status, analyserReady, analyserUnavailable, getAnalyser } = useRadio();

  useEffect(() => {
    const root = rootRef.current;
    const analyser = getAnalyser();
    if (!root || !analyser || !analyserReady || status !== "playing") return;

    const bars = Array.from(root.querySelectorAll<HTMLSpanElement>(":scope > span"));
    const levels = new Uint8Array(analyser.frequencyBinCount);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = root.getBoundingClientRect();
    let visible = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
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

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer?.observe(root);
    document.addEventListener("visibilitychange", reconcile);
    if (typeof motion.addEventListener === "function") motion.addEventListener("change", reconcile);
    else motion.addListener(reconcile);
    reconcile();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      if (typeof motion.removeEventListener === "function") motion.removeEventListener("change", reconcile);
      else motion.removeListener(reconcile);
      window.cancelAnimationFrame(frame);
      bars.forEach((bar) => { bar.style.height = "4%"; });
    };
  }, [analyserReady, getAnalyser, status]);

  return (
    <div
      ref={rootRef}
      className={className}
      role="img"
      aria-label={analyserUnavailable ? "Visualizador indisponível" : status === "playing" && analyserReady ? "Visualizador reagindo ao áudio" : "Visualizador em espera"}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => <span key={index} style={{ height: "4%" }} />)}
      {analyserUnavailable ? <p>Barras indisponíveis nesta reprodução</p> : null}
    </div>
  );
}
