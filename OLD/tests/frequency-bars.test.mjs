import assert from "node:assert/strict";
import test from "node:test";
import {
  centeredLiveSpectrumLevels,
  createFrequencyBarMotion,
  frequencyBandLevels
} from "../src/features/radio/frequency-bars.ts";

const SAMPLE_RATE = 48_000;
const FFT_SIZE = 2048;
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
  assert.deepEqual(
    moveBars(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16),
    Array(BAR_COUNT).fill(4)
  );
});

test("bass and midrange tones occupy different source bands", () => {
  const bass = frequencyBandLevels(withTone(90), SAMPLE_RATE, FFT_SIZE, 72);
  const mid = frequencyBandLevels(withTone(1_200), SAMPLE_RATE, FFT_SIZE, 72);
  assert.notEqual(
    bass.indexOf(Math.max(...bass)),
    mid.indexOf(Math.max(...mid))
  );
});

test("the source spectrum keeps useful treble above 12 kHz", () => {
  const treble = frequencyBandLevels(
    withTone(15_000),
    SAMPLE_RATE,
    FFT_SIZE,
    72
  );
  assert.ok(Math.max(...treble.slice(-12)) > 0.7);
  assert.equal(Math.max(...treble.slice(0, 30)), 0);
});

test("equal narrow-band levels are not diluted at higher frequencies", () => {
  const peaks = [90, 1_200, 15_000].map((frequency) => {
    const levels = frequencyBandLevels(
      withTone(frequency, -18),
      SAMPLE_RATE,
      FFT_SIZE,
      72
    );
    return Math.max(...levels);
  });

  assert.ok(Math.min(...peaks) > 0.7);
  assert.ok(Math.max(...peaks) - Math.min(...peaks) < 0.16);
});

test("changing only bass does not create unrelated treble energy", () => {
  const backing = flatSpectrum(-80);
  const bassHit = flatSpectrum(-80);
  bassHit[Math.round(90 / BIN_WIDTH)] = -10;

  const before = frequencyBandLevels(backing, SAMPLE_RATE, FFT_SIZE, 72);
  const after = frequencyBandLevels(bassHit, SAMPLE_RATE, FFT_SIZE, 72);
  const lowRise = Math.max(
    ...after.slice(0, 20).map((level, index) => level - before[index])
  );
  const highRise = Math.max(
    ...after.slice(-20).map((level, index) => level - before[index + 52])
  );

  assert.ok(lowRise > 0.4);
  assert.equal(highRise, 0);
});

test("a midrange tone is folded toward the center in the live fallback", () => {
  const spectrum = frequencyBandLevels(
    withTone(1_000),
    SAMPLE_RATE,
    FFT_SIZE,
    72
  );
  const centered = centeredLiveSpectrumLevels(spectrum, BAR_COUNT);
  const peak = centered.indexOf(Math.max(...centered));
  assert.ok(peak >= 12 && peak <= 23);
});

test("low and high fallback energy lives around the vocal center", () => {
  const low = centeredLiveSpectrumLevels(
    frequencyBandLevels(withTone(90), SAMPLE_RATE, FFT_SIZE, 72),
    BAR_COUNT
  );
  const high = centeredLiveSpectrumLevels(
    frequencyBandLevels(withTone(12_000), SAMPLE_RATE, FFT_SIZE, 72),
    BAR_COUNT
  );
  const center = BAR_COUNT / 2;
  assert.ok(
    Math.abs(low.indexOf(Math.max(...low)) - center) > 7
  );
  assert.ok(
    Math.abs(high.indexOf(Math.max(...high)) - center) > 4
  );
});

test("a steady spectrum settles instead of inventing continuous motion", () => {
  const moveBars = createFrequencyBarMotion(BAR_COUNT);
  const levels = flatSpectrum(-50);
  let previous = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);

  for (let frame = 0; frame < 240; frame += 1) {
    previous = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);
  }

  const next = moveBars(levels, SAMPLE_RATE, FFT_SIZE, 16);
  const drift = Math.max(
    ...next.map((height, index) => Math.abs(height - previous[index]))
  );
  assert.ok(drift < 0.01);
});


test("live fallback lets treble attack faster than bass while bass decays longer", () => {
  const bassMotion = createFrequencyBarMotion(BAR_COUNT);
  const trebleMotion = createFrequencyBarMotion(BAR_COUNT);

  const bassAttack = Math.max(
    ...bassMotion(withTone(90), SAMPLE_RATE, FFT_SIZE, 16)
  );
  const trebleAttack = Math.max(
    ...trebleMotion(withTone(15_000), SAMPLE_RATE, FFT_SIZE, 16)
  );
  assert.ok(trebleAttack > bassAttack);

  for (let frame = 0; frame < 24; frame += 1) {
    bassMotion(withTone(90), SAMPLE_RATE, FFT_SIZE, 16);
    trebleMotion(withTone(15_000), SAMPLE_RATE, FFT_SIZE, 16);
  }

  const bassRelease = Math.max(
    ...bassMotion(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16)
  );
  const trebleRelease = Math.max(
    ...trebleMotion(silentSpectrum(), SAMPLE_RATE, FFT_SIZE, 16)
  );
  assert.ok(bassRelease > trebleRelease);
});
