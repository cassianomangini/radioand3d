import assert from "node:assert/strict";
import test from "node:test";
import { getRadioDragPreview } from "../src/components/studio-radio/radio-panel-drag.ts";

test("desktop radio preview begins after the sidebar reaches its maximum", () => {
  assert.deepEqual(getRadioDragPreview(1440, 720, 700, 700), { width: 0, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 700, 0), { width: 0, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 900, 500), { width: 180, ready: false });
});

test("desktop radio opens only near the left edge and preview never exceeds the viewport", () => {
  assert.deepEqual(getRadioDragPreview(1440, 720, 1316, 57), { width: 596, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 1316, 56), { width: 596, ready: true });
  assert.deepEqual(getRadioDragPreview(1440, 720, 1600, 0), { width: 720, ready: true });
});
