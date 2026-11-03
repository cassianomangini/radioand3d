export interface MusicalVisualizerPayload {
  version: 3;
  source: "demucs+librosa";
  model: string;
  fps: number;
  barCount: number;
  frameCount: number;
  duration: number;
  encoding: "base64-u8";
  layout: {
    kind: "voice-center-instruments-around";
    voiceStart: number;
    voiceCount: number;
  };
  data: string;
}

export interface DecodedMusicalVisualizerAnalysis extends Omit<MusicalVisualizerPayload, "data"> {
  data: Uint8Array;
}

export interface ResampledVisualizerLayout {
  voiceStart: number;
  voiceCount: number;
  sideCount: number;
}

export type VisualizerBarRole = "bass" | "drums" | "other" | "voice";

export function visualizerLevelFromHeightPercent(heightPercent: number) {
  if (!Number.isFinite(heightPercent)) return 0;
  return Math.min(1, Math.max(0, (heightPercent - 4) / 92));
}

export function relaxVisualizerLevel(
  level: number,
  elapsedMs: number,
  releaseMs = 180
) {
  const safeLevel = Math.min(1, Math.max(0, Number.isFinite(level) ? level : 0));
  const elapsed = Math.min(100, Math.max(1, Number.isFinite(elapsedMs) ? elapsedMs : 16));
  const release = Math.max(1, releaseMs);
  return safeLevel * Math.exp(-elapsed / release);
}

const MAX_ANALYSIS_BYTES = 10 * 1024 * 1024;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function decodeMusicalVisualizerAnalysis(value: unknown): DecodedMusicalVisualizerAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<MusicalVisualizerPayload>;
  const layout = payload.layout;
  const barCount = payload.barCount;
  const frameCount = payload.frameCount;

  if (
    payload.version !== 3 ||
    payload.source !== "demucs+librosa" ||
    payload.encoding !== "base64-u8" ||
    typeof payload.model !== "string" ||
    !isFinitePositive(payload.fps) ||
    typeof barCount !== "number" ||
    !Number.isInteger(barCount) || barCount < 8 || barCount > 96 ||
    typeof frameCount !== "number" ||
    !Number.isInteger(frameCount) || frameCount < 1 ||
    !isFinitePositive(payload.duration) ||
    !layout || layout.kind !== "voice-center-instruments-around" ||
    !Number.isInteger(layout.voiceStart) || layout.voiceStart < 0 ||
    !Number.isInteger(layout.voiceCount) || layout.voiceCount < 1 ||
    layout.voiceStart + layout.voiceCount > barCount ||
    typeof payload.data !== "string"
  ) {
    return null;
  }

  const expectedBytes = barCount * frameCount;
  if (expectedBytes > MAX_ANALYSIS_BYTES) return null;

  let data: Uint8Array;
  try {
    data = decodeBase64(payload.data);
  } catch {
    return null;
  }
  if (data.length !== expectedBytes) return null;

  return {
    version: 3,
    source: "demucs+librosa",
    model: payload.model,
    fps: payload.fps,
    barCount,
    frameCount,
    duration: payload.duration,
    encoding: "base64-u8",
    layout,
    data
  };
}

function frameValue(analysis: DecodedMusicalVisualizerAnalysis, frame: number, bar: number): number {
  return analysis.data[frame * analysis.barCount + bar] / 255;
}

function resample(values: number[], count: number): number[] {
  if (count <= 0) return [];
  if (values.length === 0) return Array(count).fill(0);
  if (values.length === count) return [...values];
  if (count === 1) return [values[Math.floor(values.length / 2)] ?? 0];
  if (values.length === 1) return Array(count).fill(values[0]);

  return Array.from({ length: count }, (_, index) => {
    const source = index * (values.length - 1) / (count - 1);
    const left = Math.floor(source);
    const right = Math.min(values.length - 1, left + 1);
    const mix = source - left;
    return values[left] * (1 - mix) + values[right] * mix;
  });
}

export function getResampledVisualizerLayout(
  analysis: DecodedMusicalVisualizerAnalysis,
  targetBarCount: number
): ResampledVisualizerLayout {
  const safeCount = Math.max(0, Math.floor(targetBarCount));
  if (safeCount === 0) return { voiceStart: 0, voiceCount: 0, sideCount: 0 };
  if (safeCount <= 2) return { voiceStart: 0, voiceCount: safeCount, sideCount: 0 };

  const voiceRatio = analysis.layout.voiceCount / analysis.barCount;
  let voiceCount = Math.max(1, Math.round(safeCount * voiceRatio));
  voiceCount = Math.min(voiceCount, safeCount - 2);

  let outerCount = safeCount - voiceCount;
  if (outerCount % 2 !== 0) {
    if (voiceCount < safeCount - 2) voiceCount += 1;
    else voiceCount = Math.max(1, voiceCount - 1);
    outerCount = safeCount - voiceCount;
  }

  const sideCount = Math.max(0, outerCount / 2);
  return {
    voiceStart: sideCount,
    voiceCount,
    sideCount
  };
}

export function visualizerBarRole(
  index: number,
  barCount: number,
  layout: ResampledVisualizerLayout
): VisualizerBarRole {
  if (
    index >= layout.voiceStart &&
    index < layout.voiceStart + layout.voiceCount
  ) {
    return "voice";
  }

  if (layout.sideCount <= 0) return "voice";

  const outerIndex =
    index < layout.voiceStart
      ? index
      : barCount - 1 - index;
  const position = (outerIndex + 0.5) / layout.sideCount;

  if (position <= 0.21) return "bass";
  if (position <= 0.5) return "drums";
  return "other";
}

export function getResampledVisualizerRoles(
  analysis: DecodedMusicalVisualizerAnalysis,
  targetBarCount: number
): VisualizerBarRole[] {
  const layout = getResampledVisualizerLayout(analysis, targetBarCount);
  return Array.from(
    { length: Math.max(0, Math.floor(targetBarCount)) },
    (_, index) => visualizerBarRole(index, targetBarCount, layout)
  );
}

function spatialContrastFactor(role: VisualizerBarRole) {
  switch (role) {
    case "drums":
      return 1.16;
    case "other":
      return 1.12;
    case "bass":
      return 1.08;
    case "voice":
      return 1.06;
  }
}

export function enhanceVisualizerSpatialContrast(
  values: number[],
  roles: VisualizerBarRole[]
) {
  if (values.length !== roles.length) return [...values];

  const output = [...values];
  let start = 0;

  while (start < values.length) {
    const role = roles[start];
    let end = start + 1;
    while (end < values.length && roles[end] === role) end += 1;

    if (end - start > 1) {
      const segment = values.slice(start, end);
      const average =
        segment.reduce((sum, value) => sum + value, 0) / segment.length;
      const factor = spatialContrastFactor(role);

      for (let index = start; index < end; index += 1) {
        output[index] = Math.min(
          1,
          Math.max(0, average + (values[index] - average) * factor)
        );
      }
    }

    start = end;
  }

  return output;
}

export function sampleMusicalVisualizer(
  analysis: DecodedMusicalVisualizerAnalysis,
  positionSeconds: number,
  targetBarCount: number
): number[] {
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0 || targetBarCount <= 0) {
    return Array(Math.max(0, targetBarCount)).fill(0);
  }

  const framePosition = Math.min(
    analysis.frameCount - 1,
    Math.max(0, positionSeconds * analysis.fps)
  );
  const leftFrame = Math.floor(framePosition);
  const rightFrame = Math.min(analysis.frameCount - 1, leftFrame + 1);
  const mix = framePosition - leftFrame;

  const values = Array.from({ length: analysis.barCount }, (_, bar) => {
    const left = frameValue(analysis, leftFrame, bar);
    const right = frameValue(analysis, rightFrame, bar);
    return left * (1 - mix) + right * mix;
  });

  const targetLayout = getResampledVisualizerLayout(analysis, targetBarCount);
  if (targetLayout.sideCount === 0) {
    return resample(
      values.slice(
        analysis.layout.voiceStart,
        analysis.layout.voiceStart + analysis.layout.voiceCount
      ),
      targetBarCount
    );
  }

  const sourceVoiceEnd = analysis.layout.voiceStart + analysis.layout.voiceCount;
  const leftInstruments = values.slice(0, analysis.layout.voiceStart);
  const voice = values.slice(analysis.layout.voiceStart, sourceVoiceEnd);
  const rightInstruments = values.slice(sourceVoiceEnd);

  return [
    ...resample(leftInstruments, targetLayout.sideCount),
    ...resample(voice, targetLayout.voiceCount),
    ...resample(rightInstruments, targetLayout.sideCount)
  ];
}

const analysisRequests = new Map<string, Promise<DecodedMusicalVisualizerAnalysis | null>>();

export function loadMusicalVisualizerAnalysis(src: string): Promise<DecodedMusicalVisualizerAnalysis | null> {
  const cached = analysisRequests.get(src);
  if (cached) return cached;

  const request = fetch(src, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) return null;
      return decodeMusicalVisualizerAnalysis(await response.json());
    })
    .catch(() => null);
  analysisRequests.set(src, request);
  return request;
}
