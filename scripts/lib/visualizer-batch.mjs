import { createHash } from "node:crypto";

export const ANALYSIS_PREFIX = "_analysis/v1";
export const ANALYSIS_VERSION = "1";
export const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "wav", "aac", "ogg", "opus", "flac"]);

export function normalizeEtag(value) {
  return String(value ?? "").replace(/^"|"$/g, "");
}

export function normalizeTrackIdentity(value) {
  return String(value ?? "")
    .replaceAll("\\", "/")
    .normalize("NFC")
    .toLocaleLowerCase("pt-BR");
}

export function analysisObjectKey(trackId) {
  const digest = createHash("sha256").update(trackId).digest("hex");
  return `${ANALYSIS_PREFIX}/${digest}.json`;
}

export function encodePublicObjectUrl(publicBaseUrl, key) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

export function isAudioObject(key) {
  const extension = key.split(".").at(-1)?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.has(extension);
}

export function analysisFingerprint(object, options) {
  return {
    version: ANALYSIS_VERSION,
    sourceEtag: normalizeEtag(object.ETag),
    sourceSize: String(object.Size ?? 0),
    model: options.model,
    fps: String(options.fps),
    bars: String(options.bars),
    voiceBars: String(options.voiceBars)
  };
}

export function fingerprintMetadata(fingerprint) {
  return {
    "analysis-version": fingerprint.version,
    "source-etag": fingerprint.sourceEtag,
    "source-size": fingerprint.sourceSize,
    "analysis-model": fingerprint.model,
    "analysis-fps": fingerprint.fps,
    "analysis-bars": fingerprint.bars,
    "analysis-voice-bars": fingerprint.voiceBars
  };
}

export function sidecarIsCurrent(metadata, fingerprint) {
  if (!metadata) return false;
  const normalized = Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key.toLowerCase(), String(value ?? "")])
  );
  const expected = fingerprintMetadata(fingerprint);
  return Object.entries(expected).every(([key, value]) => normalized[key] === value);
}

export function reconcileR2CatalogWithLocalFiles(audioObjects, localFiles) {
  const exact = new Map();
  const byBasename = new Map();

  for (const file of localFiles) {
    exact.set(normalizeTrackIdentity(file.relativeId), file);
    const basename = normalizeTrackIdentity(file.relativeId.split("/").at(-1) ?? file.relativeId);
    const items = byBasename.get(basename) ?? [];
    items.push(file);
    byBasename.set(basename, items);
  }

  const matched = [];
  const missing = [];
  const ambiguous = [];
  const sizeMismatches = [];

  for (const object of audioObjects) {
    const trackId = object.Key;
    const exactMatch = exact.get(normalizeTrackIdentity(trackId));
    let localFile = exactMatch;

    if (!localFile) {
      const basename = normalizeTrackIdentity(trackId.split("/").at(-1) ?? trackId);
      const candidates = byBasename.get(basename) ?? [];
      if (candidates.length === 1) {
        [localFile] = candidates;
      } else if (candidates.length > 1) {
        ambiguous.push({
          trackId,
          candidates: candidates.map((candidate) => candidate.relativeId)
        });
        continue;
      }
    }

    if (!localFile) {
      missing.push(trackId);
      continue;
    }

    const r2Size = Number(object.Size ?? 0);
    if (Number.isFinite(r2Size) && r2Size > 0 && localFile.size !== r2Size) {
      sizeMismatches.push({
        trackId,
        localRelativeId: localFile.relativeId,
        r2Size,
        localSize: localFile.size
      });
      continue;
    }

    matched.push({
      object,
      trackId,
      audioPath: localFile.path,
      localRelativeId: localFile.relativeId
    });
  }

  return { matched, missing, ambiguous, sizeMismatches };
}
