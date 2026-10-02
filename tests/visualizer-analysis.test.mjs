import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeMusicalVisualizerAnalysis,
  sampleMusicalVisualizer
} from "../src/features/radio/visualizer-analysis.ts";

function payload(bytes, overrides = {}) {
  return {
    version: 2,
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
    decodeMusicalVisualizerAnalysis(payload(new Uint8Array(16), { version: 1 })),
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
