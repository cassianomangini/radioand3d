import assert from "node:assert/strict";
import test from "node:test";
import { collectAudioKeys, radioTrackFromKey } from "../src/features/radio/r2-catalog-core.ts";

test("R2 catalog reads every page and keeps filename variants", async () => {
  const tokens = [];
  const keys = await collectAudioKeys(async (token) => {
    tokens.push(token);
    if (!token) {
      return {
        Contents: [
          { Key: "CMangic - Blue Light Heaven.mp3" },
          { Key: "CMangic - Blue Light Heaven (1).mp3" },
          { Key: "cover.png" }
        ],
        IsTruncated: true,
        NextContinuationToken: "page-2"
      };
    }
    return {
      Contents: [{ Key: "subfolder/CMangic - Céu Azul.m4a" }],
      IsTruncated: false
    };
  });

  assert.deepEqual(tokens, [undefined, "page-2"]);
  assert.equal(keys.length, 3);
  assert(keys.includes("CMangic - Blue Light Heaven (1).mp3"));
  assert(keys.includes("subfolder/CMangic - Céu Azul.m4a"));
});

test("R2 catalog rejects an incomplete listing", async () => {
  await assert.rejects(
    collectAudioKeys(async () => ({ IsTruncated: true })),
    /incomplete/
  );
});

test("R2 track keeps the object key and encodes its public URL", () => {
  const track = radioTrackFromKey(
    "músicas/CMangic - Luz #1 (1).mp3",
    "https://radio.example.com/"
  );

  assert.equal(track.id, "músicas/CMangic - Luz #1 (1).mp3");
  assert.equal(track.title, "Luz #1 (1)");
  assert.equal(track.artist, "CMangic");
  assert.equal(
    track.src,
    "https://radio.example.com/m%C3%BAsicas/CMangic%20-%20Luz%20%231%20(1).mp3"
  );
});
