import assert from "node:assert/strict";
import test from "node:test";
import { resolveRadioLayoutMode } from "../src/components/studio-radio/radio-motion-spine.ts";

test("radio layout state prioritizes fullscreen and focus over width", () => {
  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: true,
      expanded: false,
      width: 480,
      defaultWidth: 480
    }),
    "fullscreen"
  );

  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: false,
      expanded: true,
      width: 690,
      defaultWidth: 480
    }),
    "focus"
  );
});

test("radio layout state distinguishes free custom width from the split default", () => {
  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: false,
      expanded: false,
      width: 575,
      defaultWidth: 480
    }),
    "custom"
  );

  assert.equal(
    resolveRadioLayoutMode({
      fullscreen: false,
      expanded: false,
      width: 480.5,
      defaultWidth: 480
    }),
    "split"
  );
});
