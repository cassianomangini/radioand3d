import assert from "node:assert/strict";
import test from "node:test";
import {
  createMusicalVisualizerMotion,
  decodeMusicalVisualizerAnalysis,
  enhanceVisualizerSpatialContrast,
  getResampledVisualizerLayout,
  getResampledVisualizerRoles,
  relaxVisualizerLevel,
  sampleMusicalVisualizer,
  visualizerLevelFromHeightPercent
} from "../src/features/radio/visualizer-analysis.ts";

function payload(bytes, overrides = {}) {
  return {
    version: 3,
    source: "demucs+librosa",
    model: "htdemucs",
    fps: 2,
    barCount: 8,
    frameCount: 2,
    duration: 1,
    encoding: "base64-u8",
    layout: {
      kind: "voice-center-instruments-around",
      voiceStart: 3,
      voiceCount: 2
    },
    data: Buffer.from(bytes).toString("base64"),
    ...overrides
  };
}

test("rejects malformed musical visualizer payloads", () => {
  assert.equal(decodeMusicalVisualizerAnalysis(payload(new Uint8Array(3))), null);
  assert.equal(
    decodeMusicalVisualizerAnalysis(payload(new Uint8Array(16), { version: 2 })),
    null
  );
});

test("samples time between frames and resizes the synchronized bar field", () => {
  const bytes = new Uint8Array(16);
  bytes.set(new Uint8Array(8).fill(0), 0);
  bytes.set(new Uint8Array(8).fill(255), 8);
  const analysis = decodeMusicalVisualizerAnalysis(payload(bytes));
  assert.ok(analysis);

  const sample = sampleMusicalVisualizer(analysis, 0.25, 4);
  for (const value of sample) {
    assert.ok(value > 0.49 && value < 0.51);
  }
});

test("keeps a centered vocal peak centered after resizing", () => {
  const bytes = new Uint8Array(16);
  bytes[3] = 255;
  bytes[4] = 255;
  bytes[11] = 255;
  bytes[12] = 255;
  const analysis = decodeMusicalVisualizerAnalysis(payload(bytes));
  assert.ok(analysis);

  const sample = sampleMusicalVisualizer(analysis, 0, 4);
  assert.ok(sample[1] > sample[0]);
  assert.ok(sample[2] > sample[3]);
});


test("resizes instruments and centered voice without leaking regions together", () => {
  const bytes = new Uint8Array(16);
  bytes[3] = 255;
  bytes[4] = 255;
  bytes[11] = 255;
  bytes[12] = 255;
  const analysis = decodeMusicalVisualizerAnalysis(payload(bytes));
  assert.ok(analysis);

  const layout = getResampledVisualizerLayout(analysis, 6);
  assert.deepEqual(layout, { voiceStart: 2, voiceCount: 2, sideCount: 2 });

  const sample = sampleMusicalVisualizer(analysis, 0, 6);
  assert.ok(sample[0] < 0.01);
  assert.ok(sample[1] < 0.01);
  assert.ok(sample[2] > 0.99);
  assert.ok(sample[3] > 0.99);
  assert.ok(sample[4] < 0.01);
  assert.ok(sample[5] < 0.01);
});

test("gives drums a faster attack and bass a longer release without inventing bar energy", () => {
  const analysis = decodeMusicalVisualizerAnalysis(payload(new Uint8Array(16)));
  assert.ok(analysis);
  const layout = getResampledVisualizerLayout(analysis, 8);
  const motion = createMusicalVisualizerMotion(8, layout);

  motion.reset(new Array(8).fill(0));
  const rising = motion.step(new Array(8).fill(1), 16);
  assert.ok(rising[1] > rising[0]);

  motion.reset(new Array(8).fill(1));
  const falling = motion.step(new Array(8).fill(0), 16);
  assert.ok(falling[0] > falling[1]);

  for (const value of [...rising, ...falling]) {
    assert.ok(value >= 0 && value <= 1);
  }
});

test("visualizer motion reset lands immediately on a seek target", () => {
  const analysis = decodeMusicalVisualizerAnalysis(payload(new Uint8Array(16)));
  assert.ok(analysis);
  const layout = getResampledVisualizerLayout(analysis, 8);
  const motion = createMusicalVisualizerMotion(8, layout);
  const target = [0, 0.2, 0.4, 0.6, 0.8, 1, 0.5, 0.1];

  motion.reset(target);
  assert.deepEqual(
    motion.step(target, 16).map((value) => Number(value.toFixed(4))),
    target
  );
});


test("maps resampled bars to the real sidecar roles", () => {
  const analysis = decodeMusicalVisualizerAnalysis(payload(new Uint8Array(16)));
  assert.ok(analysis);

  assert.deepEqual(
    getResampledVisualizerRoles(analysis, 8),
    ["bass", "drums", "other", "voice", "voice", "other", "drums", "bass"]
  );
});


test("converts rendered bar heights back into normalized visualizer levels", () => {
  assert.equal(visualizerLevelFromHeightPercent(4), 0);
  assert.equal(visualizerLevelFromHeightPercent(96), 1);
  assert.ok(Math.abs(visualizerLevelFromHeightPercent(50) - 0.5) < 0.0001);
});

test("paused visualizer relaxation decays smoothly without overshooting below baseline", () => {
  let level = 1;
  for (let frame = 0; frame < 90; frame += 1) {
    const next = relaxVisualizerLevel(level, 16);
    assert.ok(next >= 0);
    assert.ok(next <= level);
    level = next;
  }
  assert.ok(level < 0.001);
});


test("spatial contrast amplifies only differences already present in each real region", () => {
  const roles = ["bass", "bass", "drums", "drums", "voice", "voice", "other", "other"];
  const values = [0.3, 0.5, 0.25, 0.55, 0.4, 0.6, 0.2, 0.7];
  const enhanced = enhanceVisualizerSpatialContrast(values, roles);

  assert.ok(enhanced[0] < values[0]);
  assert.ok(enhanced[1] > values[1]);
  assert.ok(enhanced[2] < values[2]);
  assert.ok(enhanced[3] > values[3]);

  for (const [start, end] of [[0, 2], [2, 4], [4, 6], [6, 8]]) {
    const beforeSegment = values.slice(start, end);
    const afterSegment = enhanced.slice(start, end);
    const before = beforeSegment.reduce((sum, value) => sum + value, 0) / beforeSegment.length;
    const after = afterSegment.reduce((sum, value) => sum + value, 0) / afterSegment.length;
    assert.ok(Math.abs(before - after) < 0.0001);
  }
});

test("spatial contrast never invents variation when a region is uniform", () => {
  const roles = ["bass", "bass", "voice", "voice"];
  const values = [0.4, 0.4, 0.7, 0.7];
  assert.deepEqual(enhanceVisualizerSpatialContrast(values, roles), values);
});
