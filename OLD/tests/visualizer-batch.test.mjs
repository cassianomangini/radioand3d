import assert from "node:assert/strict";
import test from "node:test";
import {
  analysisFingerprint,
  analysisObjectKey,
  encodePublicObjectUrl,
  fingerprintMetadata,
  isAudioObject,
  reconcileR2CatalogWithLocalFiles,
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
  assert.match(left, /^_analysis\/v3\/[a-f0-9]{64}\.json$/);
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
  assert.equal(isAudioObject("_analysis/v3/file.json"), false);
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


test("batch reconciles canonical R2 tracks to local Artesopolis files", () => {
  const audioObjects = [
    { Key: "CMangic - A.mp3", Size: 100 },
    { Key: "sub/CMangic - B.m4a", Size: 200 }
  ];
  const localFiles = [
    { path: "D:/radio/CMangic - A.mp3", relativeId: "CMangic - A.mp3", size: 100 },
    { path: "D:/radio/CMangic - B.m4a", relativeId: "CMangic - B.m4a", size: 200 }
  ];

  const result = reconcileR2CatalogWithLocalFiles(audioObjects, localFiles);

  assert.equal(result.matched.length, 2);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.ambiguous, []);
  assert.deepEqual(result.sizeMismatches, []);
  assert.equal(result.matched[1].audioPath, "D:/radio/CMangic - B.m4a");
});

test("batch refuses to analyze when local file size differs from R2", () => {
  const result = reconcileR2CatalogWithLocalFiles(
    [{ Key: "CMangic - A.mp3", Size: 100 }],
    [{ path: "D:/radio/CMangic - A.mp3", relativeId: "CMangic - A.mp3", size: 99 }]
  );

  assert.equal(result.matched.length, 0);
  assert.equal(result.sizeMismatches.length, 1);
  assert.equal(result.sizeMismatches[0].trackId, "CMangic - A.mp3");
});

test("batch reports ambiguous basename matches instead of guessing", () => {
  const result = reconcileR2CatalogWithLocalFiles(
    [{ Key: "remote/CMangic - A.mp3", Size: 100 }],
    [
      { path: "D:/radio/x/CMangic - A.mp3", relativeId: "x/CMangic - A.mp3", size: 100 },
      { path: "D:/radio/y/CMangic - A.mp3", relativeId: "y/CMangic - A.mp3", size: 100 }
    ]
  );

  assert.equal(result.matched.length, 0);
  assert.equal(result.ambiguous.length, 1);
});
