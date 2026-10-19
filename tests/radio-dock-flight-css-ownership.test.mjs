import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.tsx", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");
const dock = readFileSync(new URL("../src/components/studio-radio/radio-dock-flight.tsx", import.meta.url), "utf8");
const dockCSS = readFileSync(new URL("../src/components/studio-radio/radio-dock-flight.module.css", import.meta.url), "utf8");

test("Dock flight and restore edge own their markup and CSS, without a second audio element", () => {
  assert.match(shell, /import \{ RadioDockFlight, RadioDockRestoreEdge \} from "\.\/radio-dock-flight"/);
  assert.match(shell, /flightRef=\{dockFlightRef\}/);
  assert.match(shell, /RadioDockRestoreEdge onRestore=\{restoreMediumFromPocket\}/);
  for (const name of ["radioDockFlight", "radioDockFlightArtwork", "radioDockFlightCaption", "radioDockEdge"]) {
    assert.ok(dock.includes(`styles.${name}`), `Dock component must use ${name}`);
    assert.ok(dockCSS.includes(`.${name}`), `Dock CSS must define ${name}`);
    assert.ok(!new RegExp(`\\.${name}\\b`).test(shellCSS), `Shared shell must not define ${name}`);
  }
  assert.doesNotMatch(dock, /<audio\b/);
  assert.doesNotMatch(dock, /useRadio\(/);
  assert.match(dock, /RADIO_DOCK_EDGE_RESTORE_PX = 78/);
});

test("Dock state, reduced motion and shell-only geometry keep their owners", () => {
  assert.match(dockCSS, /:global\(\[id="top"\]\)\[data-radio-docked="true"\]/);
  assert.match(dockCSS, /@media \(min-width: 73\.75rem\)/);
  assert.match(dockCSS, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(dockCSS, /\.radioDockEdge:focus-visible/);
  assert.match(shellCSS, /\.desktopShell\[data-radio-dock-ready="true"\]/);
  assert.match(shellCSS, /data-radio-dock-motion="docking"/);
  assert.match(shellCSS, /data-radio-dock-motion="restoring"/);
});
