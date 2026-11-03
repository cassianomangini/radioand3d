import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../src/components/studio-radio/site-header.tsx", import.meta.url), "utf8");
const headerCSS = readFileSync(new URL("../src/components/studio-radio/site-header.module.css", import.meta.url), "utf8");
const shellCSS = readFileSync(new URL("../src/components/studio-radio/studio-radio-shell.module.css", import.meta.url), "utf8");

test("Site header owns its navigation/social CSS and its own resize/dock appearance", () => {
  assert.match(shell, /import \{ SiteHeader \} from "\.\/site-header"/);
  assert.match(shell, /<SiteHeader\b/);
  assert.doesNotMatch(shell, /<header\b/);
  assert.match(header, /import headerStyles from "\.\/site-header\.module\.css"/);
  for (const name of ["siteHeader","brand","desktopNav","socialIcons","socialIcon","headerActions","menuButton","mobileNav"]) {
    assert.ok(header.includes(`headerStyles.${name}`), `SiteHeader TSX needs headerStyles.${name}`);
    assert.ok(new RegExp(`\\.${name}\\b`).test(headerCSS), `Header CSS needs ${name}`);
    assert.ok(!new RegExp(`\\.${name}\\b`).test(shellCSS), `Legacy shell still owns ${name}`);
  }
});

test("Header responds to #top dock/fullscreen states without coupling CSS Modules", () => {
  assert.match(headerCSS, /:global\(\[id="top"\]\)\[data-radio-docked="true"\]/);
  assert.match(headerCSS, /:global\(\[id="top"\]\)\[data-radio-fullscreen="true"\]/);
  assert.doesNotMatch(headerCSS, /data-radio-divider-settling="true"/);
  assert.match(headerCSS, /data-radio-dock-motion/);
  assert.match(headerCSS, /@media \(max-width: 73\.74rem\)/);
  assert.match(headerCSS, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(shellCSS, /\.desktopShell/);
  assert.match(shellCSS, /\.radioPanel/);
  assert.match(shellCSS, /\.mobileMiniPlayer/);
});
