import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.tsx", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");
const dock = readFileSync(new URL("../src/components/studio-radio/radio-dock-flight.tsx", import.meta.url), "utf8");
const dockCSS = readFileSync(new URL("../src/components/studio-radio/radio-dock-flight.module.css", import.meta.url), "utf8");

test("Dock flight owns its markup and CSS, without a second audio element", () => {
  assert.match(shell, /import \{ RadioDockFlight \} from "\.\/radio-dock-flight"/);
  assert.match(shell, /flightRef=\{dockFlightRef\}/);
  for (const name of ["radioDockFlight", "radioDockFlightArtwork", "radioDockFlightCaption"]) {
    assert.ok(dock.includes(`styles.${name}`), `Dock component must use ${name}`);
    assert.ok(dockCSS.includes(`.${name}`), `Dock CSS must define ${name}`);
    assert.ok(!new RegExp(`\\.${name}\\b`).test(shellCSS), `Shared shell must not define ${name}`);
  }
  assert.doesNotMatch(dock, /<audio\b/);
  assert.doesNotMatch(dock, /useRadio\(/);
  assert.doesNotMatch(dock, /RadioDockRestoreEdge|onPointerDown|onPointerUp/);
});

test("Dock state, reduced motion and shell-only geometry keep their owners", () => {
  assert.doesNotMatch(dockCSS, /radioDockEdge/);
  assert.match(shellCSS, /\.resizeHandle\s*\{[^}]*pointer-events:\s*none/s);
  assert.match(shellCSS, /data-radio-dock-motion="docking"/);
  assert.match(shellCSS, /data-radio-dock-motion="restoring"/);
});
