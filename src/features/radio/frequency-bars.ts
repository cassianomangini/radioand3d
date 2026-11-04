const MIN_HEIGHT = 4;
const MAX_HEIGHT = 96;
const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 18_000;
const VISUAL_FLOOR_DB = -72;
const VISUAL_CEILING_DB = -8;
const LOW_ATTACK_MS = 58;
const LOW_RELEASE_MS = 230;
const MID_ATTACK_MS = 34;
const MID_RELEASE_MS = 138;
const HIGH_ATTACK_MS = 18;
const HIGH_RELEASE_MS = 74;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function resample(values: number[], count: number): number[] {
  if (count <= 0) return [];
  if (values.length === 0) return Array(count).fill(0);
  if (values.length === count) return values;
  if (count === 1) return [Math.max(...values)];

  if (values.length > count) {
    return Array.from({ length: count }, (_, index) => {
      const start = Math.floor(index * values.length / count);
      const end = Math.max(start + 1, Math.ceil((index + 1) * values.length / count));
      return Math.max(...values.slice(start, end));
    });
  }

  return Array.from({ length: count }, (_, index) => {
    const source = index * (values.length - 1) / (count - 1);
    const left = Math.floor(source);
    const right = Math.min(values.length - 1, left + 1);
    const mix = source - left;
    return values[left] * (1 - mix) + values[right] * mix;
  });
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

export function centeredLiveSpectrumLevels(levels: number[], count: number): number[] {
  if (count <= 0) return [];
  if (!levels.length) return Array(count).fill(0);

  let voiceCount = Math.max(6, Math.round(count * 0.22));
  if (voiceCount % 2 !== count % 2) voiceCount += 1;
  voiceCount = Math.min(count - 4, voiceCount);

  const sideCount = Math.floor((count - voiceCount) / 2);
  const centerCount = count - sideCount * 2;
  const voiceLow = Math.max(1, Math.floor(levels.length * 0.24));
  const voiceHigh = Math.min(levels.length - 1, Math.ceil(levels.length * 0.79));

  const center = resample(levels.slice(voiceLow, voiceHigh), centerCount);
  const outerSource = [...levels.slice(0, voiceLow), ...levels.slice(voiceHigh)];
  const outer = resample(outerSource, sideCount * 2);
  const left = new Array<number>(sideCount);
  const right = new Array<number>(sideCount);

  for (let index = 0; index < sideCount; index += 1) {
    left[index] = outer[index * 2] ?? 0;
    right[sideCount - 1 - index] = outer[index * 2 + 1] ?? 0;
  }

  return [...left, ...center, ...right];
}

function liveFrequencyResponse(index: number, count: number) {
  const position = count <= 1 ? 0.5 : index / (count - 1);

  if (position < 0.24) {
    return { attackMs: LOW_ATTACK_MS, releaseMs: LOW_RELEASE_MS };
  }
  if (position < 0.62) {
    return { attackMs: MID_ATTACK_MS, releaseMs: MID_RELEASE_MS };
  }
  return { attackMs: HIGH_ATTACK_MS, releaseMs: HIGH_RELEASE_MS };
}

export function createFrequencyBarMotion(count: number) {
  const sourceCount = Math.max(48, count * 2);
  const displayedSpectrum = new Float32Array(sourceCount);
  const displayedBars = new Float32Array(count).fill(MIN_HEIGHT);

  return (levelsDb: Float32Array, sampleRate: number, fftSize: number, elapsedMs: number): number[] => {
    const spectrum = frequencyBandLevels(levelsDb, sampleRate, fftSize, sourceCount);
    const elapsed = Math.min(100, Math.max(1, elapsedMs));

    for (let index = 0; index < sourceCount; index += 1) {
      const target = spectrum[index] ?? 0;
      const previous = displayedSpectrum[index];
      const profile = liveFrequencyResponse(index, sourceCount);
      const responseMs = target >= previous ? profile.attackMs : profile.releaseMs;
      const response = 1 - Math.exp(-elapsed / responseMs);
      displayedSpectrum[index] += (target - previous) * response;
    }

    const spatialLevels = centeredLiveSpectrumLevels(
      Array.from(displayedSpectrum),
      count
    );

    return spatialLevels.map((level, index) => {
      const target = MIN_HEIGHT + level * (MAX_HEIGHT - MIN_HEIGHT);
      displayedBars[index] = target;
      return displayedBars[index];
    });
  };
}
