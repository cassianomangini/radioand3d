import assert from "node:assert/strict";
import test from "node:test";
import { resolvePublishedRadioTracks, validateRadioPublications } from "../src/features/radio/publications-core.ts";
import { readFileSync } from "node:fs";

const sourceTracks = [
  { id: "old/a.mp3", title: "Old A", artist: "CMangic", src: "https://audio.example/old/a.mp3", visualizerAnalysisSrc: "https://audio.example/a.json" },
  { id: "old/b.mp3", title: "Old B", artist: "CMangic", src: "https://audio.example/old/b.mp3" },
  { id: "new/unapproved.mp3", title: "Unapproved", artist: "CMangic", src: "https://audio.example/new/unapproved.mp3" }
];

const publications = [
  { id: "track-a", slug: "same-title", title: "Same Title", artist: "CMangic", state: "published", primaryVersionId: "version-a", versions: [{ id: "version-a", r2Key: "old/a.mp3", state: "published" }] },
  { id: "track-b", slug: "same-title-2", title: "Same Title", artist: "CMangic", state: "published", primaryVersionId: "version-b", versions: [{ id: "version-b", r2Key: "old/b.mp3", state: "published" }] },
  { id: "track-draft", slug: "not-public", title: "Not Public", artist: "CMangic", state: "draft", primaryVersionId: "version-draft", versions: [{ id: "version-draft", r2Key: "new/unapproved.mp3", state: "draft" }] }
];

test("only editorially published R2 tracks enter the public playlist with distinct permanent IDs", () => {
  const result = resolvePublishedRadioTracks(publications, sourceTracks);

  assert.deepEqual(result.map(({ id, publicId, shareSlug }) => ({ id, publicId, shareSlug })), [
    { id: "old/a.mp3", publicId: "track-a", shareSlug: "same-title" },
    { id: "old/b.mp3", publicId: "track-b", shareSlug: "same-title-2" }
  ]);
  assert.equal(result[0].visualizerAnalysisSrc, "https://audio.example/a.json");
  assert.equal(result[0].title, "Same Title");
});

test("approved R2 snapshot keeps every current recording explicitly published and uniquely addressable", () => {
  const manifest = JSON.parse(readFileSync(new URL("../src/features/radio/publications.generated.json", import.meta.url), "utf8"));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.tracks.length, 343);
  assert.doesNotThrow(() => validateRadioPublications(manifest.tracks));
  assert.ok(manifest.tracks.every((track) => track.state === "published" && track.versions.length === 1));
  assert.equal(new Set(manifest.tracks.map((track) => track.versions[0].r2Key)).size, 343);
  const repeatedTitle = manifest.tracks.filter((track) => track.title === "Concrete Constellations");
  assert.equal(repeatedTitle.length, 2);
  assert.notEqual(repeatedTitle[0].slug, repeatedTitle[1].slug);
});

test("publication manifest rejects colliding slugs and version keys", () => {
  assert.throws(() => validateRadioPublications([
    publications[0],
    { ...publications[1], slug: "same-title" }
  ]), /slug/i);
  assert.throws(() => validateRadioPublications([
    publications[0],
    { ...publications[1], versions: [{ id: "version-b", r2Key: "old/a.mp3", state: "published" }] }
  ]), /r2Key/i);
});

test("changing the primary recording preserves the public identity and URL", () => {
  const publication = {
    id: "permanent-track", slug: "permanent-song", title: "Permanent Song", artist: "CMangic",
    state: "published", primaryVersionId: "first",
    versions: [
      { id: "first", r2Key: "recordings/first.mp3", state: "published" },
      { id: "second", r2Key: "recordings/second.mp3", state: "published" }
    ]
  };
  const recordings = [
    { id: "recordings/first.mp3", title: "old", artist: "CMangic", src: "https://audio.example/first.mp3" },
    { id: "recordings/second.mp3", title: "new", artist: "CMangic", src: "https://audio.example/second.mp3" }
  ];
  const first = resolvePublishedRadioTracks([publication], recordings)[0];
  const second = resolvePublishedRadioTracks([{ ...publication, primaryVersionId: "second" }], recordings)[0];

  assert.equal(first.publicId, second.publicId);
  assert.equal(first.shareSlug, second.shareSlug);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.src, second.src);
});
