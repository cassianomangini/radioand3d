import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hub = readFileSync(new URL("../src/components/studio-radio/studio-hub.tsx", import.meta.url), "utf8");
const hubCSS = readFileSync(new URL("../src/components/studio-radio/studio-hub.module.css", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");

test("StudioHub owns its eight classes, never importing shared shell CSS", () => {
  assert.match(hub, /from "\.\/studio-hub\.module\.css"/);
  assert.doesNotMatch(hub, /from "\.\/studio-radio-shell\.module\.css"/);
  for (const name of ["studioDetailRail","studioDetailCard","studioQuotePhoto","studioCardHead","studioCardLabel","studioCardFoot","studioCardAction","studioCardMediaPlaceholder"]) {
    assert.ok(hub.includes(`styles.${name}`), `Hub JSX missing ${name}`);
    assert.ok(hubCSS.includes(`.${name}`), `Hub CSS missing ${name}`);
    assert.ok(!shellCSS.includes(`.${name}`), `Shell still imports Hub's ${name}`);
  }
});

test("Hub preserves three approved cards and isolated route/motion states", () => {
  for (const card of ["prints", "quote", "products"]) {
    assert.ok(hub.includes(`data-studio-card="${card}"`));
    assert.ok(hubCSS.includes(`[data-studio-card="${card}"]`));
  }
  assert.match(hubCSS, /:global\(\[id="studio"\]\[data-studio-route="detail"\]\)/);
  assert.match(hubCSS, /data-studio-transition="exiting"/);
  assert.match(hubCSS, /@media \(max-width: 73\.74rem\)/);
  assert.match(hubCSS, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(hub, /<StudioPrintsCarousel active=\{active && !radioFullscreen\}/);
  assert.doesNotMatch(hub, /<audio\b/);
});
