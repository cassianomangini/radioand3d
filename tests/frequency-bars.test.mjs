import assert from "node:assert/strict";
import test from "node:test";
import { frequencyBarHeights, waveformRms } from "../src/features/radio/frequency-bars.ts";

test("silence leaves every visualizer bar at its quiet baseline", () => {
  assert.deepEqual(frequencyBarHeights(new Uint8Array(512), 22050, 36, 0), Array(36).fill(4));
});

test("waveform level follows the actual sample amplitude", () => {
  assert.equal(waveformRms(new Uint8Array(2048).fill(128)), 0);
  assert.ok(waveformRms(Uint8Array.of(64, 192)) > waveformRms(Uint8Array.of(112, 144)));
});

test("a known frequency lifts bars only when the signal has energy", () => {
  const levels = new Uint8Array(512);
  levels[23] = 255;
  const heights = frequencyBarHeights(levels, 22050, 36, 1);
  assert.equal(heights.length, 36);
  assert.ok(heights.some((height) => height > 4));
  assert.ok(heights.some((height) => height === 4));
});

test("a quieter narrow frequency remains visible inside a wide high band", () => {
  const levels = new Uint8Array(512);
  levels[180] = 48;
  const heights = frequencyBarHeights(levels, 48000, 36, 1);
  assert.ok(heights.some((height) => height > 4));
  assert.ok(heights.some((height) => height === 4));
});

test("loud music keeps headroom so bars can respond to changing levels", () => {
  const quiet = frequencyBarHeights(new Uint8Array(2048).fill(80), 48000, 36, 1);
  const loud = frequencyBarHeights(new Uint8Array(2048).fill(255), 48000, 36, 1);
  assert.ok(quiet.every((height) => height > 4));
  assert.ok(loud.every((height) => height > quiet[0] && height < 100));
});

test("the same spectrum rises with the waveform pulse", () => {
  const levels = new Uint8Array(1024).fill(160);
  const soft = frequencyBarHeights(levels, 48000, 36, 0.2);
  const strong = frequencyBarHeights(levels, 48000, 36, 0.9);
  assert.ok(strong.every((height, index) => height > soft[index]));
});

test("a moderate signal uses a meaningful part of the visualizer height", () => {
  const heights = frequencyBarHeights(new Uint8Array(1024).fill(100), 48000, 36, 0.5);
  assert.ok(heights.every((height) => height > 50 && height < 70));
});
