import assert from "node:assert/strict";
import test from "node:test";
import { frequencyBarHeights } from "../src/features/radio/frequency-bars.ts";

test("silence leaves every visualizer bar at its quiet baseline", () => {
  assert.deepEqual(frequencyBarHeights(new Uint8Array(512), 22050, 36), Array(36).fill(4));
});

test("a known frequency lifts bars only when the signal has energy", () => {
  const levels = new Uint8Array(512);
  levels[23] = 255;
  const heights = frequencyBarHeights(levels, 22050, 36);
  assert.equal(heights.length, 36);
  assert.ok(heights.some((height) => height > 4));
  assert.ok(heights.some((height) => height === 4));
});

test("a quieter narrow frequency remains visible inside a wide high band", () => {
  const levels = new Uint8Array(512);
  levels[180] = 48;
  const heights = frequencyBarHeights(levels, 48000, 36);
  assert.ok(heights.some((height) => height > 4));
  assert.ok(heights.some((height) => height === 4));
});
