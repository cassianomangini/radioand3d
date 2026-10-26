import assert from "node:assert/strict";
import test from "node:test";
import { inspectVisualizerFrames } from "../scripts/lib/visualizer-diagnostics.mjs";

const roles = ["bass", "drums", "other", "voice", "voice", "other", "drums", "bass"];

function bytes(frames) {
  return Uint8Array.from(frames.flat().map((value) => Math.round(value * 255)));
}

test("diagnostics expose collapsed common motion", () => {
  const frames = Array.from({ length: 20 }, (_, frame) => {
    const level = (frame % 10) / 10;
    return Array(8).fill(level);
  });
  const report = inspectVisualizerFrames({
    data: bytes(frames),
    frameCount: frames.length,
    barCount: 8,
    roles
  });

  assert.ok(report.commonMotionRatio > 0.99);
  assert.ok(report.spatialSpread < 0.001);
  assert.ok(report.roleContrast < 0.001);
});

test("diagnostics distinguish independent role movement from a global pulse", () => {
  const frames = Array.from({ length: 24 }, (_, frame) => [
    frame % 4 === 0 ? 1 : 0.1,
    frame % 3 === 0 ? 0.9 : 0.05,
    0.15 + (frame % 5) * 0.08,
    frame % 6 < 3 ? 0.8 : 0.1,
    frame % 6 < 3 ? 0.75 : 0.08,
    0.45 - (frame % 5) * 0.06,
    frame % 3 === 1 ? 0.85 : 0.04,
    frame % 4 === 2 ? 0.95 : 0.08
  ]);
  const report = inspectVisualizerFrames({
    data: bytes(frames),
    frameCount: frames.length,
    barCount: 8,
    roles
  });

  assert.ok(report.commonMotionRatio < 0.55);
  assert.ok(report.spatialSpread > 0.2);
  assert.ok(report.roleContrast > 0.08);
  assert.ok(report.activeTransitionRatio > 0.8);
  assert.ok(report.roleActivity.bass > 0);
  assert.ok(report.roleActivity.voice > 0);
});

test("diagnostics report quiet passages instead of treating them as missing motion", () => {
  const frames = [
    ...Array.from({ length: 5 }, () => Array(8).fill(0.02)),
    ...Array.from({ length: 5 }, () => Array(8).fill(0.6))
  ];
  const report = inspectVisualizerFrames({
    data: bytes(frames),
    frameCount: frames.length,
    barCount: 8,
    roles
  });

  assert.equal(report.quietFrameRatio, 0.5);
  assert.ok(report.dynamicRange > 0.5);
});
