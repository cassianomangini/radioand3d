import assert from "node:assert/strict";
import test from "node:test";
import {
  createRadioSnapPoints,
  getRadioDragMagnet,
  getRadioDragPreview,
  getRadioReleaseTarget
} from "../src/components/studio-radio/radio-panel-drag.ts";

test("desktop radio preview begins after the sidebar reaches its maximum", () => {
  assert.deepEqual(getRadioDragPreview(1440, 720, 700, 700, 900), { width: 0, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 700, 0, 900), { width: 0, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 900, 500, 900), { width: 180, ready: false });
});

test("desktop radio opens after half the drag and preview never exceeds the viewport", () => {
  assert.deepEqual(getRadioDragPreview(1440, 720, 1316, 451, 900), { width: 596, ready: false });
  assert.deepEqual(getRadioDragPreview(1440, 720, 1316, 450, 900), { width: 596, ready: true });
  assert.deepEqual(getRadioDragPreview(1440, 720, 1600, 0, 900), { width: 720, ready: true });
});

test("divider exposes compact, balanced and focus snap points without duplicates", () => {
  assert.deepEqual(createRadioSnapPoints(400, 480, 690), [
    { kind: "compact", width: 400 },
    { kind: "balanced", width: 480 },
    { kind: "focus", width: 690 }
  ]);

  assert.deepEqual(createRadioSnapPoints(400, 480, 480), [
    { kind: "compact", width: 400 },
    { kind: "focus", width: 480 }
  ]);
});

test("divider magnet only attracts when the pointer is close to a useful width", () => {
  const snaps = createRadioSnapPoints(400, 480, 690);
  const near = getRadioDragMagnet(468, snaps);
  const far = getRadioDragMagnet(570, snaps);

  assert.equal(near.snap, "balanced");
  assert.ok(near.width > 468 && near.width < 480);
  assert.deepEqual(far, { width: 570, snap: null });
});

test("slow release snaps near a useful width but preserves intentional custom widths", () => {
  const snaps = createRadioSnapPoints(400, 480, 690);

  assert.deepEqual(getRadioReleaseTarget(445, 0.05, snaps), {
    width: 480,
    snap: "balanced"
  });
  assert.deepEqual(getRadioReleaseTarget(575, 0, snaps), {
    width: 575,
    snap: null
  });
});

test("a deliberate flick advances to the next snap point in the drag direction", () => {
  const snaps = createRadioSnapPoints(400, 480, 690);

  assert.deepEqual(getRadioReleaseTarget(530, 0.7, snaps), {
    width: 690,
    snap: "focus"
  });
  assert.deepEqual(getRadioReleaseTarget(620, -0.7, snaps), {
    width: 480,
    snap: "balanced"
  });
});
