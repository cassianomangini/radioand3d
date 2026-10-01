import assert from "node:assert/strict";
import test from "node:test";
import { createFrequencyBarMotion, frequencyBandLevels, waveformRms } from "../src/features/radio/frequency-bars.ts";

test("silence leaves every visualizer bar at its quiet baseline", () => {
  const moveBars = createFrequencyBarMotion(36);
  assert.deepEqual(moveBars(new Uint8Array(1024), 48000, 0, 16), Array(36).fill(4));
});

test("waveform level follows the actual sample amplitude", () => {
  assert.equal(waveformRms(new Uint8Array(2048).fill(128)), 0);
  assert.ok(waveformRms(Uint8Array.of(64, 192)) > waveformRms(Uint8Array.of(112, 144)));
});

test("bass and guitar-range energy occupy different bars", () => {
  const bass = new Uint8Array(1024);
  const guitar = new Uint8Array(1024);
  bass[4] = 220;
  guitar[160] = 220;
  const bassBands = frequencyBandLevels(bass, 48000, 36);
  const guitarBands = frequencyBandLevels(guitar, 48000, 36);
  assert.ok(bassBands.slice(0, 12).some((level) => level > 0));
  assert.ok(guitarBands.slice(24).some((level) => level > 0));
  assert.ok(bassBands.slice(24).every((level) => level === 0));
  assert.ok(guitarBands.slice(0, 12).every((level) => level === 0));
});

test("a quieter narrow frequency remains visible inside a wide high band", () => {
  const levels = new Uint8Array(1024);
  levels[90] = 48;
  const heights = createFrequencyBarMotion(36)(levels, 48000, 0.05, 16);
  assert.ok(heights.some((height) => height > 4));
  assert.ok(heights.some((height) => height === 4));
});

test("loud music keeps headroom so bars can respond to changing levels", () => {
  const moveBars = createFrequencyBarMotion(36);
  const loud = new Uint8Array(1024).fill(255);
  let heights = [];
  for (let frame = 0; frame < 180; frame += 1) heights = moveBars(loud, 48000, 0.3, 16);
  assert.ok(heights.every((height) => height > 4 && height < 96));
});

test("a sudden solo rises above its settled level", () => {
  const moveBars = createFrequencyBarMotion(36);
  const quiet = new Uint8Array(1024);
  const solo = new Uint8Array(1024);
  quiet[160] = 70;
  solo[160] = 235;
  const band = frequencyBandLevels(solo, 48000, 36).findIndex((level) => level > 0);
  let before = 4;
  for (let frame = 0; frame < 100; frame += 1) before = moveBars(quiet, 48000, 0.07, 16)[band];
  const attack = moveBars(solo, 48000, 0.13, 16)[band];
  let settled = attack;
  for (let frame = 0; frame < 180; frame += 1) settled = moveBars(solo, 48000, 0.13, 16)[band];
  assert.ok(attack > before + 10);
  assert.ok(attack > settled + 5);
});

test("an RMS beat accents bass without lifting unrelated high bands", () => {
  const moveBars = createFrequencyBarMotion(36);
  const levels = new Uint8Array(1024);
  levels[4] = 180;
  levels[160] = 180;
  const bands = frequencyBandLevels(levels, 48000, 36);
  const bass = bands.findIndex((level) => level > 0);
  const guitar = bands.findLastIndex((level) => level > 0);
  let before = [];
  for (let frame = 0; frame < 100; frame += 1) before = moveBars(levels, 48000, 0.06, 16);
  const beat = moveBars(levels, 48000, 0.4, 16);
  assert.ok(beat[bass] - before[bass] > beat[guitar] - before[guitar] + 4);
});

test("waveform changes alone cannot animate silent frequency bands", () => {
  const heights = createFrequencyBarMotion(36)(new Uint8Array(1024), 48000, 0.8, 16);
  assert.ok(heights.every((height) => height === 4));
});

test("moderate steady music stays around the middle of the visualizer", () => {
  const moveBars = createFrequencyBarMotion(36);
  const levels = new Uint8Array(1024).fill(100);
  let heights = [];
  for (let frame = 0; frame < 120; frame += 1) heights = moveBars(levels, 48000, 0.12, 16);
  assert.ok(heights.every((height) => height > 35 && height < 55));
});

test("the vocal range remains visible in a mixed spectrum", () => {
  const bands = frequencyBandLevels(new Uint8Array(1024).fill(100), 48000, 36);
  assert.ok(bands[18] > bands[2]);
  assert.ok(bands[18] > bands[34]);
});

test("a changing vocal-range tone moves middle bars over steady backing", () => {
  const moveBars = createFrequencyBarMotion(36);
  const first = new Uint8Array(1024).fill(80);
  const next = new Uint8Array(1024).fill(80);
  first[48] = 170;
  first[49] = 90;
  next[48] = 90;
  next[49] = 170;
  assert.deepEqual(frequencyBandLevels(first, 48000, 36), frequencyBandLevels(next, 48000, 36));

  let before = [];
  for (let frame = 0; frame < 100; frame += 1) before = moveBars(first, 48000, 0.15, 16);
  const after = moveBars(next, 48000, 0.15, 16);
  assert.ok(after[20] > before[20] + 7);
  assert.ok(after[20] - before[20] > after[2] - before[2] + 7);
});

test("continuous midrange movement dances without pinning bars near the top", () => {
  const moveBars = createFrequencyBarMotion(36);
  const first = new Uint8Array(1024).fill(80);
  const next = new Uint8Array(1024).fill(80);
  first[48] = next[49] = 170;
  first[49] = next[48] = 90;
  const heights = [];
  for (let frame = 0; frame < 180; frame += 1) {
    const height = moveBars(frame % 2 === 0 ? first : next, 48000, 0.15, 16)[20];
    if (frame >= 120) heights.push(height);
  }
  assert.ok(Math.max(...heights) < 75);
  assert.ok(Math.max(...heights) - Math.min(...heights) > 5);
});
