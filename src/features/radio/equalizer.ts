export const EQUALIZER_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export const EQUALIZER_MIN_DB = -12;
export const EQUALIZER_MAX_DB = 12;

export function clampEqualizerGain(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(EQUALIZER_MAX_DB, Math.max(EQUALIZER_MIN_DB, Math.round(value)));
}

export function appliedEqualizerGains(gains: readonly number[], enabled: boolean) {
  return EQUALIZER_FREQUENCIES.map((_, index) => enabled ? clampEqualizerGain(gains[index] ?? 0) : 0);
}

export function connectEqualizer(
  context: AudioContext,
  source: MediaElementAudioSourceNode,
  analyser: AnalyserNode,
  gains: readonly number[],
  enabled: boolean
) {
  const applied = appliedEqualizerGains(gains, enabled);
  const filters = EQUALIZER_FREQUENCIES.map((frequency, index) => {
    const filter = context.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = frequency;
    filter.Q.value = Math.SQRT2;
    filter.gain.value = applied[index];
    return filter;
  });

  source.connect(filters[0]);
  for (let index = 1; index < filters.length; index += 1) {
    filters[index - 1].connect(filters[index]);
  }
  filters.at(-1)?.connect(analyser);
  analyser.connect(context.destination);
  return filters;
}

export function updateEqualizer(
  filters: readonly BiquadFilterNode[],
  gains: readonly number[],
  enabled: boolean,
  currentTime: number
) {
  const applied = appliedEqualizerGains(gains, enabled);
  filters.forEach((filter, index) => {
    filter.gain.setTargetAtTime(applied[index], currentTime, 0.015);
  });
}
