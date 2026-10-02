import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisFingerprint,
  analysisObjectKey,
  encodePublicObjectUrl,
  fingerprintMetadata,
  isAudioObject,
  sidecarIsCurrent
} from "../scripts/lib/visualizer-batch.mjs";

const options = {
  model: "htdemucs",
  fps: 25,
  bars: 36,
  voiceBars: 8
};

test("batch keeps the radio object key as the stable analysis identity", () => {
  const left = analysisObjectKey("folder/CMangic - Luz.mp3");
  const right = analysisObjectKey("folder/CMangic - Luz.mp3");
  const other = analysisObjectKey("folder/CMangic - Luz (1).mp3");

  assert.equal(left, right);
  assert.notEqual(left, other);
  assert.match(left, /^_analysis\/v1\/[a-f0-9]{64}\.json$/);
});

test("batch encodes R2 public object URLs without changing the track identity", () => {
  assert.equal(
    encodePublicObjectUrl(
      "https://radio.example.com/",
      "músicas/CMangic - Luz #1.mp3"
    ),
    "https://radio.example.com/m%C3%BAsicas/CMangic%20-%20Luz%20%231.mp3"
  );
});

test("batch recognizes the complete supported audio extension set", () => {
  assert.equal(isAudioObject("a.MP3"), true);
  assert.equal(isAudioObject("folder/b.m4a"), true);
  assert.equal(isAudioObject("folder/c.flac"), true);
  assert.equal(isAudioObject("_analysis/v1/file.json"), false);
});

test("remote sidecar metadata makes the full batch resumable", () => {
  const fingerprint = analysisFingerprint(
    { ETag: '"abc123"', Size: 456 },
    options
  );
  const metadata = fingerprintMetadata(fingerprint);

  assert.equal(sidecarIsCurrent(metadata, fingerprint), true);
  assert.equal(
    sidecarIsCurrent(
      { ...metadata, "source-etag": "changed" },
      fingerprint
    ),
    false
  );
  assert.equal(
    sidecarIsCurrent(
      { ...metadata, "analysis-model": "different-model" },
      fingerprint
    ),
    false
  );
});
