import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const lyricComponent = readFileSync(
  new URL("../src/features/radio/radio-lyrics.tsx", import.meta.url), "utf8"
);
const lyricCss = readFileSync(
  new URL("../src/features/radio/radio-lyrics.module.css", import.meta.url), "utf8"
);
const shellCss = readFileSync(
  new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8"
);

test("RadioLyrics owns its layout instead of importing the Studio shell CSS", () => {
  assert.match(lyricComponent, /import styles from "\.\/radio-lyrics\.module\.css"/);
  assert.doesNotMatch(lyricComponent, /studio-radio-shell\.module\.css/);
  for (const selector of ["lyricsPanel", "lyricsHeader", "lyricsClose", "lyricsScroll", "lyricsText", "lyricsStatus"]) {
    assert.ok(lyricCss.includes(`.${selector}`), `Lyrics Module missing ${selector}`);
    assert.ok(lyricComponent.includes(`styles.${selector}`), `RadioLyrics missing class reference ${selector}`);
    assert.ok(!shellCss.includes(`.${selector}`), `Legacy shell still owns ${selector}`);
  }
});

test("Lyrics responsiveness uses stable DOM attributes and keeps its animation", () => {
  assert.match(lyricCss, /:global\(\[data-radio-surface="mobile"\]\)/);
  assert.match(lyricCss, /data-mobile-panel="playlist"/);
  assert.match(lyricCss, /data-mobile-panel="lyrics"/);
  assert.match(lyricCss, /data-radio-fullscreen="true"/);
  assert.match(lyricCss, /@container radio-panel \(min-width: 64rem\)/);
  assert.match(lyricCss, /@keyframes c1-lyrics-enter/);
  assert.doesNotMatch(shellCss, /@keyframes c1-lyrics-enter/);
});
