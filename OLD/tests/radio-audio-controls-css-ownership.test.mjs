import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.tsx", import.meta.url), "utf8");
const player = readFileSync(new URL("../src/components/studio-radio/radio-content.tsx", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");
const audioCSS = readFileSync(new URL("../src/components/studio-radio/radio-audio-controls.module.css", import.meta.url), "utf8");
const playerCSS = readFileSync(new URL("../src/components/studio-radio/radio-content.module.css", import.meta.url), "utf8");

test("one module owns the volume controls and shared analyser visual styling", () => {
  for (const name of ["volumeMenu","volumeTrigger","volumePopover","muteButton","volumeSlider","volumeLevel","visualizer"]) {
    assert.ok(audioCSS.includes(`.${name}`), `Missing shared ${name}`);
    assert.ok(!new RegExp(`\\.${name}\\b`).test(shellCSS), `Legacy shell still owns ${name}`);
    assert.ok(shell.includes(`sharedAudioStyles.${name}`), `Pocket player missing shared ${name}`);
    assert.ok(player.includes(`sharedAudioStyles.${name}`), `Full player missing shared ${name}`);
  }
  assert.match(shell, /import sharedAudioStyles from "\.\/radio-audio-controls\.module\.css"/);
  assert.match(player, /import sharedAudioStyles from "\.\/radio-audio-controls\.module\.css"/);
});

test("mini popover layout and fullscreen visualizer use stable DOM state", () => {
  assert.match(shell, /data-radio-volume-menu="pocket"/);
  assert.match(shell, /data-radio-volume-popover="pocket"/);
  assert.match(shellCSS, /:global\(\[data-radio-volume-popover="pocket"\]\)/);
  assert.match(shellCSS, /:global\(\[data-radio-motion-key="visualizer"\]\)/);
  assert.match(player, /sharedAudioStyles\.volumeTrigger\} \$\{playerStyles\.volumeTrigger/);
  assert.match(player, /sharedAudioStyles\.visualizer\} \$\{playerStyles\.visualizer/);
  assert.match(playerCSS, /\.transport \.volumeTrigger/);
  assert.match(playerCSS, /\.radioContent\[data-radio-surface="desktop"\] \.visualizer/);
  assert.match(audioCSS, /\.visualizer\[data-playback-state="playing"\]/);
  assert.match(shellCSS, /\.miniPlay/);
});
