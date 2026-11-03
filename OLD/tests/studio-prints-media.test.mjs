import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const manifestPath = path.join(root, "src/features/studio/prints-media.json");

test("Studio photo/video manifest is honest, unique, and publishable", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.ok(Array.isArray(manifest.items));
  const usedIds = new Set();
  for (const entry of manifest.items) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.ok(!usedIds.has(entry.id), `duplicate media id: ${entry.id}`);
    usedIds.add(entry.id);
    assert.ok(entry.kind === "video" || entry.kind === "image");
    assert.equal(typeof entry.title, "string");
    assert.ok(entry.title.trim().length > 0);
    assert.equal(typeof entry.alt, "string");
    assert.ok(entry.alt.trim().length > 0);
    assert.match(entry.src, /^\/images\/studio\/impressoes\/[a-z0-9/-]+\.(?:jpe?g|png|webp|avif|mp4|webm)$/);
    await access(path.join(root, "public", entry.src.slice(1)));
  }
});
