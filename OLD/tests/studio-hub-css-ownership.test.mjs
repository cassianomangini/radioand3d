import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hub = readFileSync(new URL("../src/components/studio-radio/studio-hub.tsx", import.meta.url), "utf8");
const hubCSS = readFileSync(new URL("../src/components/studio-radio/studio-hub.module.css", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");

test("Studio Hub owns navigation and gallery CSS independently of the shell", () => {
  assert.match(hub, /from "\.\/studio-hub\.module\.css"/);
  assert.doesNotMatch(hub, /from "\.\/studio-radio-shell\.module\.css"/);
  for (const name of ["studioDetailRail", "studioDetailCard", "studioTop", "studioActions", "mediaStrip", "thumbnail"]) {
    assert.ok(hub.includes(`styles.${name}`), `Hub JSX missing ${name}`);
    assert.ok(hubCSS.includes(`.${name}`), `Hub CSS missing ${name}`);
    assert.ok(!shellCSS.includes(`.${name}`), `Shell still owns Hub's ${name}`);
  }
});

test("Studio preserves the print carousel, four working links and Radio continuity", () => {
  for (const card of ["quote", "products", "materials", "about"]) {
    assert.ok(hub.includes(`id: "${card}"`));
    assert.ok(hubCSS.includes(`[data-studio-card="${card}"]`));
  }
  assert.match(hub, /<StudioPrintsCarousel active=\{active && !radioFullscreen\}/);
  assert.match(hub, /data-studio-media-strip="true"/);
  assert.doesNotMatch(hub, /<audio\b/);
  assert.match(hubCSS, /@container studio/);
  assert.match(hubCSS, /@media \(prefers-reduced-motion: reduce\)/);
});
