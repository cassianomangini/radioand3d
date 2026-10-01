export function waveformRms(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  let power = 0;
  for (const sample of samples) {
    const value = (sample - 128) / 128;
    power += value * value;
  }
  return Math.sqrt(power / samples.length);
}

export function frequencyBarHeights(levels: Uint8Array, sampleRate: number, count: number, pulse: number): number[] {
  const nyquist = sampleRate / 2;
  const envelope = 0.18 + 0.82 * Math.min(1, Math.max(0, pulse));
  return Array.from({ length: count }, (_, index) => {
    const low = 45 * Math.pow(10000 / 45, index / count);
    const high = 45 * Math.pow(10000 / 45, (index + 1) / count);
    const start = Math.max(1, Math.floor(low / nyquist * levels.length));
    const end = Math.max(start + 1, Math.min(levels.length, Math.ceil(high / nyquist * levels.length)));
    let total = 0;
    let peak = 0;
    for (let bin = start; bin < end; bin += 1) {
      const level = levels[bin] ?? 0;
      total += level;
      peak = Math.max(peak, level);
    }
    const amplitude = (0.8 * total / (end - start) + 0.2 * peak) / 255;
    return Math.max(4, Math.min(90, 4 + Math.pow(amplitude, 1.2) * envelope * 86));
  });
}
