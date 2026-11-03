import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const welcome = readFileSync(new URL("../src/components/studio-radio/studio-welcome.tsx", import.meta.url), "utf8");
const welcomeCSS = readFileSync(new URL("../src/components/studio-radio/studio-welcome.module.css", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");

test("welcome text and CTA styles belong to their own CSS module", () => {
  assert.match(welcome, /import styles from "\.\/studio-welcome\.module\.css"/);
  for (const name of ["studioRevealChar","studioRevealWord","studioIdentity","studioEyebrowStack","studioGreeting","studioHomePhrase","studioRevealAccent","lead","studioRouteActions","primaryAction"]) {
    assert.ok(welcome.includes(`styles.${name}`), `Welcome JSX lacks ${name}`);
    assert.ok(welcomeCSS.includes(`.${name}`), `Welcome CSS lacks ${name}`);
    assert.ok(!shellCSS.includes(`.${name}`), `Shell retains ${name}`);
  }
});

test("welcome reveal respects Studio states, dock state and reduced motion", () => {
  assert.match(welcomeCSS, /@keyframes studio-letter-in/);
  assert.doesNotMatch(shellCSS, /@keyframes studio-letter-in/);
  assert.match(welcomeCSS, /:global\(\[id="studio"\]\[data-studio-route="home"\]\)/);
  assert.match(welcomeCSS, /:global\(\[id="top"\]\[data-radio-docked="true"\]\)/);
  assert.match(welcomeCSS, /@container studio \(min-width: 52rem\)/);
  assert.match(welcomeCSS, /@media \(prefers-reduced-motion: reduce\)/);
});
