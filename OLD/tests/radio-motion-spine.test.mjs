import assert from "node:assert/strict";
import test from "node:test";
import { resolveRadioLayoutMode } from "../src/components/studio-radio/radio-motion-spine.ts";

test("radio layout state prioritizes fullscreen over dock", () => {
  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: true,
      docked: true
    }),
    "fullscreen"
  );

  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: false,
      docked: true
    }),
    "docked"
  );
});

test("radio layout state returns split when the sidebar is at its opening size", () => {
  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: false
    }),
    "split"
  );
});

test("docked is a real presentation state and fullscreen still wins", () => {
  const base = {};
  assert.equal(resolveRadioLayoutMode({ ...base, fullscreen: false, docked: true }), "docked");
  assert.equal(resolveRadioLayoutMode({ ...base, fullscreen: true, docked: true }), "fullscreen");
  assert.equal(resolveRadioLayoutMode({ ...base, fullscreen: false, docked: false }), "split");
});
