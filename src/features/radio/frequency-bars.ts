const MIN_HEIGHT = 4;
const MAX_HEIGHT = 96;

export function waveformRms(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  let power = 0;
  for (const sample of samples) {
    const value = (sample - 128) / 128;
    power += value * value;
  }
  return Math.sqrt(power / samples.length);
}

type BandFeature = { energy: number; flux: number };

function frequencyBandFeatures(levels: Uint8Array, previousLevels: Uint8Array | null, sampleRate: number, count: number): BandFeature[] {
  if (levels.length === 0 || sampleRate <= 0) return Array.from({ length: count }, () => ({ energy: 0, flux: 0 }));

  const nyquist = sampleRate / 2;
  const highestFrequency = Math.min(12_000, nyquist * 0.95);
  const ratio = highestFrequency / 45;
  let previousEnd = 1;

  return Array.from({ length: count }, (_, index) => {
    const low = 45 * Math.pow(ratio, index / count);
    const high = 45 * Math.pow(ratio, (index + 1) / count);
    const start = Math.max(previousEnd, Math.floor(low / nyquist * levels.length));
    const end = Math.min(levels.length, Math.max(start + 1, Math.ceil(high / nyquist * levels.length)));
    previousEnd = end;
    if (start >= end) return { energy: 0, flux: 0 };

    let total = 0;
    let peak = 0;
    let fluxTotal = 0;
    let fluxPeak = 0;
    for (let bin = start; bin < end; bin += 1) {
      const value = levels[bin];
      total += value;
      peak = Math.max(peak, value);
      const rise = Math.max(0, value - (previousLevels?.[bin] ?? value) - 2);
      fluxTotal += rise;
      fluxPeak = Math.max(fluxPeak, rise);
    }

    const center = Math.sqrt(low * high);
    const vocalRange = Math.max(0, 1 - Math.abs(Math.log2(center / 850)) / 2.6);
    const energy = (0.55 * total / (end - start) + 0.45 * peak) / 255;
    return {
      energy: Math.min(1, energy * (1 + 0.45 * vocalRange)),
      flux: (0.45 * fluxTotal / (end - start) + 0.55 * fluxPeak) / 255
    };
  });
}

export function frequencyBandLevels(levels: Uint8Array, sampleRate: number, count: number): number[] {
  return frequencyBandFeatures(levels, null, sampleRate, count).map(({ energy }) => energy);
}

export function createFrequencyBarMotion(count: number) {
  const reference = new Float32Array(count);
  const fluxReference = new Float32Array(count);
  const previous = new Float32Array(count);
  const displayed = new Float32Array(count).fill(MIN_HEIGHT);
  let averageRms = 0;
  let previousSpectrum: Uint8Array | null = null;

  return (levels: Uint8Array, sampleRate: number, rms: number, elapsedMs: number): number[] => {
    const bands = frequencyBandFeatures(levels, previousSpectrum, sampleRate, count);
    if (previousSpectrum?.length !== levels.length) previousSpectrum = new Uint8Array(levels.length);
    previousSpectrum.set(levels);
    const elapsed = Math.min(80, Math.max(8, elapsedMs));
    const rmsAttack = Math.max(0, rms - averageRms);
    averageRms += (rms - averageRms) * (1 - Math.exp(-elapsed / 650));
    const middleWeight = (index: number) => Math.max(0, 1 - Math.abs((index + 0.5) / count - 0.53) / 0.31);
    const freshFlux = bands.map(({ flux }, index) => {
      const rise = Math.max(0, flux - fluxReference[index] * 1.05);
      fluxReference[index] += (flux - fluxReference[index]) * (1 - Math.exp(-elapsed / 900));
      return rise;
    });
    let middleFlux = 0;
    let middleWeightTotal = 0;
    freshFlux.forEach((flux, index) => {
      const weight = middleWeight(index);
      middleFlux += flux * weight;
      middleWeightTotal += weight;
    });
    const middlePulse = Math.min(1, middleFlux / (middleWeightTotal || 1) * 14);

    return bands.map(({ energy }, index) => {
      const weight = middleWeight(index);
      const flux = freshFlux[index];
      const onset = Math.max(0, energy - previous[index]);
      reference[index] += (energy - reference[index]) * (1 - Math.exp(-elapsed / 850));
      const contrast = Math.max(0, energy - reference[index]);
      const body = Math.pow(energy, 0.75) * 54 + (1 - Math.exp(-energy * 12)) * 7;
      const accent = Math.min(1, onset * 2.5 + contrast * 0.5 + flux * (2 + weight * 8)) * (28 + weight * 14);
      const middleMotion = weight * middlePulse * Math.min(1, energy * 3) * 18;
      const bassWeight = Math.pow(1 - index / count, 5);
      const beat = bassWeight * Math.min(1, rmsAttack * 8) * Math.min(1, energy * 2) * 20;
      const target = Math.min(MAX_HEIGHT, MIN_HEIGHT + body + accent + middleMotion + beat);
      const response = 1 - Math.exp(-elapsed / (target > displayed[index] ? 12 : 115));
      displayed[index] += (target - displayed[index]) * response;
      previous[index] = energy;
      return displayed[index];
    });
  };
}
