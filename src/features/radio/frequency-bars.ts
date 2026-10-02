const MIN_HEIGHT = 4;
const MAX_HEIGHT = 96;
const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 18_000;
const VISUAL_FLOOR_DB = -72;
const VISUAL_CEILING_DB = -8;
const ATTACK_MS = 20;
const RELEASE_MS = 90;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function frequencyBandLevels(
  levelsDb: Float32Array,
  sampleRate: number,
  fftSize: number,
  count: number
): number[] {
  if (count <= 0) return [];
  if (levelsDb.length === 0 || sampleRate <= 0 || fftSize <= 0) {
    return Array(count).fill(0);
  }

  const nyquist = sampleRate / 2;
  const highestFrequency = Math.min(MAX_FREQUENCY, nyquist * 0.98);
  if (highestFrequency <= MIN_FREQUENCY) return Array(count).fill(0);

  const ratio = highestFrequency / MIN_FREQUENCY;
  const binWidth = sampleRate / fftSize;

  return Array.from({ length: count }, (_, index) => {
    const low = MIN_FREQUENCY * Math.pow(ratio, index / count);
    const high = MIN_FREQUENCY * Math.pow(ratio, (index + 1) / count);
    const startBin = Math.max(1, Math.floor(low / binWidth - 0.5));
    const endBin = Math.min(levelsDb.length - 1, Math.ceil(high / binWidth + 0.5));

    let bandPower = 0;

    for (let bin = startBin; bin <= endBin; bin += 1) {
      const binLow = Math.max(0, (bin - 0.5) * binWidth);
      const binHigh = Math.min(nyquist, (bin + 0.5) * binWidth);
      const overlapHz = Math.max(0, Math.min(high, binHigh) - Math.max(low, binLow));
      if (overlapHz === 0) continue;

      const db = levelsDb[bin];
      if (Number.isFinite(db)) {
        bandPower += Math.pow(10, db / 10) * (overlapHz / binWidth);
      }
    }

    if (bandPower === 0) return 0;

    const bandDb = 10 * Math.log10(bandPower);
    return clamp01((bandDb - VISUAL_FLOOR_DB) / (VISUAL_CEILING_DB - VISUAL_FLOOR_DB));
  });
}

export function createFrequencyBarMotion(count: number) {
  const displayed = new Float32Array(count).fill(MIN_HEIGHT);

  return (levelsDb: Float32Array, sampleRate: number, fftSize: number, elapsedMs: number): number[] => {
    const levels = frequencyBandLevels(levelsDb, sampleRate, fftSize, count);
    const elapsed = Math.min(100, Math.max(1, elapsedMs));

    return levels.map((level, index) => {
      const target = MIN_HEIGHT + level * (MAX_HEIGHT - MIN_HEIGHT);
      const responseMs = target > displayed[index] ? ATTACK_MS : RELEASE_MS;
      const response = 1 - Math.exp(-elapsed / responseMs);
      displayed[index] += (target - displayed[index]) * response;
      return displayed[index];
    });
  };
}
