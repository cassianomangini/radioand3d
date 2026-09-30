export function frequencyBarHeights(levels: Uint8Array, sampleRate: number, count: number): number[] {
  const nyquist = sampleRate / 2;
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
    const amplitude = (0.55 * total / (end - start) + 0.45 * peak) / 255;
    return Math.max(4, Math.min(100, amplitude * 145));
  });
}
