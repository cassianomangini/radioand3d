import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/studio-radio/radio-content.tsx", import.meta.url), "utf8");
const ownedCSS = readFileSync(new URL("../src/components/studio-radio/radio-content.module.css", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");

test("RadioContent owns its thirty CSS classes, without reclaiming mini-player CSS", () => {
  assert.match(source, /import playerStyles from "\.\/radio-content\.module\.css"/);
  for (const name of ["radioContent","radioHeader","iconButton","radioLayoutActions","sharedTrackPrompt","sharedTrackPlaying","coverArt","coverCaption","coverBadge","coverShare","progressBlock","progressSeek","seekPreview","progressTimes","transport","modeButton","playButton","queueHeader","searchField","panelToggle","trackList","shareableTrackRow","trackRow","trackThumb","trackMeta","trackState","duration","trackShareButton","emptyState","playerMessage"]) {
    assert.ok(source.includes(`playerStyles.${name}`), `Player missing ${name}`);
    assert.match(ownedCSS, new RegExp(`\\.${name}\\b`), `Owned CSS missing ${name}`);
    assert.doesNotMatch(shellCSS, new RegExp(`\\.${name}\\b`), `Shared shell still owns ${name}`);
  }
});

test("volume, visualizer and animation bridges preserve shared controls and motion", () => {
  assert.match(source, /styles\.volumeTrigger\} \$\{playerStyles\.volumeTrigger/);
  assert.match(source, /styles\.visualizer\} \$\{playerStyles\.visualizer/);
  assert.match(ownedCSS, /@keyframes playback-state-orbit/);
  assert.match(ownedCSS, /@keyframes c1-cover-caption-enter/);
  assert.match(ownedCSS, /@container radio-panel \(max-width: 39\.99rem\)/);
  assert.match(ownedCSS, /:global\(\[id="top"\]\[data-radio-fullscreen="true"\]\)/);
  assert.match(ownedCSS, /data-radio-surface="mobile"/);
  assert.match(ownedCSS, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(shellCSS, /\.volumeMenu/);
  assert.match(shellCSS, /\.volumePopover/);
  assert.match(shellCSS, /\.visualizer/);
  assert.match(shellCSS, /\.miniPlay/);
});
