"use client";

import { useEffect, useRef } from "react";
import { createFrequencyBarMotion, waveformRms } from "./frequency-bars";
import { useRadio } from "./radio-provider";

export function RadioVisualizer({ className, barCount = 36, active = true }: { className: string; barCount?: number; active?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { status, analyserReady, analyserUnavailable, getAnalyser } = useRadio();

  useEffect(() => {
    const root = rootRef.current;
    const analyser = getAnalyser();
    if (!root || !analyser || !analyserReady || status !== "playing" || !active) return;

    const bars = Array.from(root.querySelectorAll<HTMLSpanElement>(":scope > span"));
    const levels = new Uint8Array(analyser.frequencyBinCount);
    const waveform = new Uint8Array(analyser.fftSize);
    const moveBars = createFrequencyBarMotion(bars.length);
    const bounds = root.getBoundingClientRect();
    let visible = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    let frame = 0;
    let previousFrame = 0;

    function draw(now: number) {
      if (!analyser) return;
      analyser.getByteFrequencyData(levels);
      analyser.getByteTimeDomainData(waveform);
      const elapsed = previousFrame === 0 ? 16 : now - previousFrame;
      previousFrame = now;
      const heights = moveBars(levels, analyser.context.sampleRate, waveformRms(waveform), elapsed);
      bars.forEach((bar, index) => {
        bar.style.height = `${heights[index]}%`;
      });
      frame = window.requestAnimationFrame(draw);
    }

    function reconcile() {
      window.cancelAnimationFrame(frame);
      if (visible && !document.hidden) {
        previousFrame = 0;
        frame = window.requestAnimationFrame(draw);
      }
    }

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer?.observe(root);
    document.addEventListener("visibilitychange", reconcile);
    reconcile();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      window.cancelAnimationFrame(frame);
      bars.forEach((bar) => { bar.style.height = "4%"; });
    };
  }, [active, analyserReady, barCount, getAnalyser, status]);

  return (
    <div
      ref={rootRef}
      className={className}
      role="img"
      aria-label={analyserUnavailable ? "Visualizador indisponível" : status === "playing" && analyserReady && active ? "Visualizador reagindo ao áudio" : "Visualizador em espera"}
    >
      {Array.from({ length: barCount }, (_, index) => <span key={index} style={{ height: "4%" }} />)}
      {analyserUnavailable ? <p>Barras indisponíveis nesta reprodução</p> : null}
    </div>
  );
}
