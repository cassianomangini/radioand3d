"use client";

import { useEffect, useRef, useState } from "react";
import { createFrequencyBarMotion } from "./frequency-bars";
import { useRadio } from "./radio-provider";
import {
  enhanceVisualizerSpatialContrast,
  getResampledVisualizerRoles,
  loadMusicalVisualizerAnalysis,
  relaxVisualizerLevel,
  sampleMusicalVisualizer,
  visualizerLevelFromHeightPercent,
  type DecodedMusicalVisualizerAnalysis
} from "./visualizer-analysis";

interface AnalysisResult {
  trackId: string;
  analysis: DecodedMusicalVisualizerAnalysis | null;
}

const SYNCHRONIZED_ATTACK_MS = 45;
const SYNCHRONIZED_RELEASE_MS = 95;

export function RadioVisualizer({
  className,
  barCount = 36,
  active = true,
  motionKey
}: {
  className: string;
  barCount?: number;
  active?: boolean;
  motionKey?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const {
    status,
    currentTrack,
    analyserReady,
    analyserUnavailable,
    getAnalyser,
    getCurrentTime
  } = useRadio();
  const currentTrackId = currentTrack?.id ?? null;
  const analysisSrc = currentTrack?.visualizerAnalysisSrc ?? null;
  const currentAnalysis = analysisResult?.trackId === currentTrackId
    ? analysisResult.analysis
    : null;

  useEffect(() => {
    if (!currentTrackId || !analysisSrc) return;
    let cancelled = false;

    void loadMusicalVisualizerAnalysis(analysisSrc).then((analysis) => {
      if (!cancelled) setAnalysisResult({ trackId: currentTrackId, analysis });
    });

    return () => {
      cancelled = true;
    };
  }, [analysisSrc, currentTrackId]);

  useEffect(() => {
    const root = rootRef.current;
    const analyser = getAnalyser();
    const liveFallbackReady = Boolean(analyser && analyserReady);
    if (
      !root ||
      status !== "playing" ||
      !active ||
      (!currentAnalysis && !liveFallbackReady)
    ) {
      return;
    }

    const bars = Array.from(root.querySelectorAll<HTMLSpanElement>(":scope > span"));
    const levels = analyser ? new Float32Array(analyser.frequencyBinCount) : null;
    const moveBars = analyser ? createFrequencyBarMotion(bars.length) : null;
    const synchronizedRoles = currentAnalysis
      ? getResampledVisualizerRoles(currentAnalysis, bars.length)
      : null;
    const displayedLevels = bars.map((bar) =>
      visualizerLevelFromHeightPercent(Number.parseFloat(bar.style.height || "4"))
    );

    const bounds = root.getBoundingClientRect();
    let visible =
      bounds.width > 0 &&
      bounds.height > 0 &&
      bounds.bottom > 0 &&
      bounds.top < window.innerHeight &&
      bounds.right > 0 &&
      bounds.left < window.innerWidth;
    let frame = 0;
    let previousFrame = 0;
    let previousPosition = currentAnalysis ? getCurrentTime() : -1;

    function scheduleDraw() {
      frame = window.requestAnimationFrame(draw);
    }

    function cancelScheduledDraw() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    function draw(now: number) {
      let heights: number[];
      const elapsed = previousFrame === 0
        ? 16
        : Math.min(250, Math.max(1, now - previousFrame));
      previousFrame = now;

      if (currentAnalysis) {
        const position = getCurrentTime();
        const sampledTargets = sampleMusicalVisualizer(
          currentAnalysis,
          position,
          bars.length
        );
        const targets = synchronizedRoles
          ? enhanceVisualizerSpatialContrast(sampledTargets, synchronizedRoles)
          : sampledTargets;
        const jumped =
          previousPosition >= 0 &&
          Math.abs(position - previousPosition) > Math.max(0.28, elapsed / 1000 * 3.5);
        previousPosition = position;

        heights = targets.map((target, index) => {
          const previous = displayedLevels[index];
          const responseMs = target >= previous
            ? SYNCHRONIZED_ATTACK_MS
            : SYNCHRONIZED_RELEASE_MS;
          const blend = 1 - Math.exp(-elapsed / responseMs);
          const level = jumped ? target : previous + (target - previous) * blend;
          displayedLevels[index] = level;
          return 4 + level * 92;
        });
      } else if (analyser && levels && moveBars) {
        analyser.getFloatFrequencyData(levels);
        heights = moveBars(
          levels,
          analyser.context.sampleRate,
          analyser.fftSize,
          elapsed
        );
      } else {
        return;
      }

      bars.forEach((bar, index) => {
        bar.style.height = `${heights[index]}%`;
      });
      scheduleDraw();
    }

    function reconcile() {
      cancelScheduledDraw();
      if (visible && !document.hidden) {
        previousFrame = 0;
        scheduleDraw();
      }
    }

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            reconcile();
          });
    observer?.observe(root);
    document.addEventListener("visibilitychange", reconcile);
    reconcile();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      cancelScheduledDraw();
    };
  }, [
    active,
    analyserReady,
    barCount,
    currentAnalysis,
    getAnalyser,
    getCurrentTime,
    status
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const hasVisualizationSource = Boolean(
      currentAnalysis || (getAnalyser() && analyserReady)
    );
    if (status === "playing" && active && hasVisualizationSource) return;

    const bars = Array.from(root.querySelectorAll<HTMLSpanElement>(":scope > span"));
    if (!bars.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      bars.forEach((bar) => {
        bar.style.height = "4%";
      });
      return;
    }

    let frame = 0;
    let previousFrame = 0;
    const levels = bars.map((bar) =>
      visualizerLevelFromHeightPercent(
        Number.parseFloat(bar.style.height || "4")
      )
    );

    function relax(now: number) {
      const elapsed = previousFrame === 0 ? 16 : now - previousFrame;
      previousFrame = now;
      let moving = false;

      bars.forEach((bar, index) => {
        levels[index] = relaxVisualizerLevel(levels[index], elapsed);
        if (levels[index] > 0.002) moving = true;
        bar.style.height = `${4 + levels[index] * 92}%`;
      });

      if (moving) {
        frame = window.requestAnimationFrame(relax);
      } else {
        bars.forEach((bar) => {
          bar.style.height = "4%";
        });
      }
    }

    frame = window.requestAnimationFrame(relax);
    return () => window.cancelAnimationFrame(frame);
  }, [
    active,
    analyserReady,
    currentAnalysis,
    getAnalyser,
    status
  ]);

  const synchronized = Boolean(
    status === "playing" && currentAnalysis && active
  );
  const synchronizedRoles = currentAnalysis
    ? getResampledVisualizerRoles(currentAnalysis, barCount)
    : null;
  const live = Boolean(
    status === "playing" && analyserReady && active
  );

  return (
    <div
      ref={rootRef}
      className={className}
      data-radio-motion-key={motionKey}
      data-playback-state={status}
      role="img"
      aria-label={
        synchronized
          ? "Visualizador sincronizado à análise musical"
          : analyserUnavailable && !currentAnalysis
            ? "Visualizador indisponível"
            : live
              ? "Visualizador reagindo ao áudio"
              : "Visualizador em espera"
      }
    >
      {Array.from({ length: barCount }, (_, index) => (
        <span
          key={index}
          data-visualizer-role={synchronizedRoles?.[index]}
          style={{ height: "4%" }}
        />
      ))}
      {analyserUnavailable && !currentAnalysis ? (
        <p>Barras indisponíveis nesta reprodução</p>
      ) : null}
    </div>
  );
}
