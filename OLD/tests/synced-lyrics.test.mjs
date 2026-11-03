import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveLyricLineIndex,
  getActiveLyricWordIndex,
  getStartedLyricWordIndex
} from "../src/features/radio/synced-lyrics.ts";

const lines = [
  { kind: "section", text: "[Verse]", breakBefore: false },
  {
    kind: "line",
    text: "primeira linha",
    breakBefore: false,
    start: 1,
    end: 2,
    confidence: 1,
    words: [
      { text: "primeira", start: 1, end: 1.45, matched: true },
      { text: "linha", start: 1.55, end: 2, matched: true }
    ]
  },
  {
    kind: "line",
    text: "segunda linha",
    breakBefore: false,
    start: 4,
    end: 5,
    confidence: 1,
    words: [
      { text: "segunda", start: 4, end: 4.45, matched: true },
      { text: "linha", start: 4.55, end: 5, matched: true }
    ]
  }
];

test("selects the timed line and leaves instrumental gaps inactive", () => {
  assert.equal(getActiveLyricLineIndex(lines, 1.6), 1);
  assert.equal(getActiveLyricLineIndex(lines, 2.4), 1);
  assert.equal(getActiveLyricLineIndex(lines, 3.2), -1);
  assert.equal(getActiveLyricLineIndex(lines, 4.2), 2);
});

test("selects the active word inside the active lyric line", () => {
  const line = lines[1];
  assert.equal(getActiveLyricWordIndex(line, 1.2), 0);
  assert.equal(getActiveLyricWordIndex(line, 1.7), 1);
  assert.equal(getActiveLyricWordIndex(line, 0.9), -1);
});


test("keeps completed-word context during short gaps between recognized words", () => {
  const line = lines[1];
  assert.equal(getStartedLyricWordIndex(line, 0.9), -1);
  assert.equal(getStartedLyricWordIndex(line, 1.2), 0);
  assert.equal(getStartedLyricWordIndex(line, 1.5), 0);
  assert.equal(getStartedLyricWordIndex(line, 1.7), 1);
});
