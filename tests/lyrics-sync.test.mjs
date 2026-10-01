import assert from "node:assert/strict";
import test from "node:test";
import { buildSyncedLyrics, normalizeWord } from "../scripts/lib/lyrics-sync.mjs";

function whisper(words, language = "pt") {
  return {
    language,
    word_segments: words.map(([word, start, end]) => ({ word, start, end, score: 0.9 }))
  };
}

test("normalizes accents and punctuation without changing canonical display text", () => {
  assert.equal(normalizeWord("Coração!"), "coracao");
  assert.equal(normalizeWord("don't"), "dont");
});

test("keeps repeated lyric lines attached to chronological recognized words", () => {
  const result = buildSyncedLyrics(
    "Vem comigo\nVem comigo",
    whisper([
      ["Vem", 1, 1.2], ["comigo", 1.25, 1.7],
      ["Vem", 4, 4.2], ["comigo", 4.25, 4.7]
    ]),
    { minCoverage: 1 }
  );

  assert.equal(result.lines[0].start, 1);
  assert.equal(result.lines[1].start, 4);
});

test("interpolates a missing canonical word between timed anchors", () => {
  const result = buildSyncedLyrics(
    "eu vou ficar aqui",
    whisper([["eu", 1, 1.2], ["vou", 1.25, 1.5], ["aqui", 2, 2.3]]),
    { minCoverage: 0.5 }
  );

  const line = result.lines[0];
  assert.equal(line.kind, "line");
  assert.equal(line.words[2].text, "ficar");
  assert.equal(line.words[2].matched, false);
  assert.ok(line.words[2].start >= 1.5);
  assert.ok(line.words[2].end <= 2);
});

test("rejects a transcript that has too little evidence for the canonical lyrics", () => {
  assert.throws(
    () => buildSyncedLyrics(
      "uma letra completamente diferente desta frase",
      whisper([["banana", 1, 1.3], ["abacaxi", 1.4, 1.7]]),
      { minCoverage: 0.3 }
    ),
    /coverage/i
  );
});
