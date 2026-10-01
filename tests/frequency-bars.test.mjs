import assert from "node:assert/strict";
import test from "node:test";
import { createFrequencyBarMotion, frequencyBandLevels } from "../src/features/radio/frequency-bars.ts";

const SAMPLE_RATE = 48_000;
const FFT_SIZE = 4096;
const BIN_COUNT = FFT_SIZE / 2;
const BAR_COUNT = 36;
const BIN_WIDTH = SAMPLE_RATE / FFT_SIZE;

function silentSpectrum() {
  return new Float32Array(BIN_COUNT).fill(Number.NEGATIVE_INFINITY);
}

function flatSpectrum(db) {
  return new Float32Array(BIN_COUNT).fill(db);
}

function withTone(frequency, db = -12, baseDb = Number.NEGATIVE_INFINITY) {
  const levels = new Float32Array(BIN_COUNT).fill(baseDb);
  levels[Math.round(frequency / BIN_WIDTH)] = db;
  return levels;
}

test("silence leaves every visualizer bar at its quiet baseline", () => {
  const moveBars = createFrequencyBarMotion(BAR_COUNT);
  assert.deepEqual(moveBars(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16), Array(BAR_COUNT).fill(4));
});

test("bass and midrange tones occupy different parts of the spectrum", () => {
  const bass = frequencyBandLevels(withTone(90), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const mid = frequencyBandLevels(withTone(1_200), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const bassPeak = bass.indexOf(Math.max(...bass));
  const midPeak = mid.indexOf(Math.max(...mid));

  assert.ok(bassPeak >= 0 && bassPeak < 10);
  assert.ok(midPeak > bassPeak + 8);
  assert.ok(Math.max(...bass.slice(20)) === 0);
  assert.ok(Math.max(...mid.slice(0, 8)) === 0);
});

test("the visualizer keeps useful treble above 12 kHz", () => {
  const treble = frequencyBandLevels(withTone(15_000), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  assert.ok(Math.max(...treble.slice(-6)) > 0);
  assert.equal(Math.max(...treble.slice(0, 20)), 0);
});

test("equal energy is not boosted just because it sits in the vocal range", () => {
  const levels = frequencyBandLevels(flatSpectrum(-42), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  assert.ok(min > 0.45 && max < 0.55);
  assert.ok(max - min < 0.01);
});

test("changing only the bass does not lift unrelated high-frequency bars", () => {
  const moveBars = createFrequencyBarMotion(BAR_COUNT);
  const backing = flatSpectrum(-60);
  let before = [];

  for (let frame = 0; frame < 180; frame += 1) {
    before = moveBars(backing, SAMPLE_RATE, FFT_SIZE, 16);
  }

  const bassHit = flatSpectrum(-60);
  bassHit[Math.round(90 / BIN_WIDTH)] = -10;
  const after = moveBars(bassHit, SAMPLE_RATE, FFT_SIZE, 16);

  const lowRise = Math.max(...after.slice(0, 10).map((height, index) => height - before[index]));
  const highRise = Math.max(...after.slice(24).map((height, index) => height - before[index + 24]));

  assert.ok(lowRise > 5);
  assert.ok(highRise < 0.1);
});

test("a steady spectrum settles instead of inventing continuous motion", () => {
  const moveBars = createFrequencyBarMotion(BAR_COUNT);
  const levels = flatSpectrum(-38);
  let previous = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);

  for (let frame = 0; frame < 240; frame += 1) {
    previous = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);
  }

  const next = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);
  const drift = Math.max(...next.map((height, index) => Math.abs(height - previous[index])));
  assert.ok(drift < 0.01);
});

test("attack is fast while release remains smooth", () => {
  const moveBars = createFrequencyBarMotion(BAR_COUNT);
  const tone = withTone(1_000, -10);
  const bandLevels = frequencyBandLevels(tone, SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const band = bandLevels.indexOf(Math.max(...bandLevels));

  const baseline = moveBars(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16)[band];
  const attacked = moveBars(tone, SAMPLE_RATE, FFT_SIZE, 16)[band];
  const released = moveBars(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16)[band];

  assert.ok(attacked > baseline + 10);
  assert.ok(released < attacked);
  assert.ok(released > baseline + 5);
});

test("a stronger signal produces a taller bar in the same frequency band", () => {
  const quiet = frequencyBandLevels(withTone(800, -46), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const loud = frequencyBandLevels(withTone(800, -18), SAMPLE_RATE, FFT_SIZE, BAR_COUNT);
  const band = loud.indexOf(Math.max(...loud));

  assert.ok(loud[band] > quiet[band] + 0.3);
});
