import assert from "node:assert/strict";
import test from "node:test";
import {
  getMinRadioWidth,
  getMaxRadioWidth,
  clampRadioWidth,
  getDefaultWidth,
  getRouteDefaultRadioWidth
} from "../src/components/studio-radio/radio-panel-layout.ts";

test("Radio panel minimum/maximum depend on actual shell width", () => {
  const cases = [
    { shell: 1180, min: 340, max: 508 },
    { shell: 1440, min: 340, max: 768 },
    { shell: 1760, min: 414, max: 1088 },
    { shell: 2500, min: 588, max: 1120 }
  ];
  for (const { shell, min, max } of cases) {
    assert.equal(getMinRadioWidth(shell), min, `minimum @${shell}`);
    assert.equal(getMaxRadioWidth(shell), max, `maximum @${shell}`);
    assert.equal(getDefaultWidth(shell), Math.round(shell * 0.3), `home split preset @${shell}`);
    assert.equal(getRouteDefaultRadioWidth(shell, "home"), getDefaultWidth(shell));
    assert.equal(getRouteDefaultRadioWidth(shell, "detail"), min);
  }
});

test("fixed sidebar width stays within the available Studio space", () => {
  for (const shell of [640, 800, 1024, 1180, 1440, 1760, 2500]) {
    const min = getMinRadioWidth(shell);
    const max = getMaxRadioWidth(shell);
    assert.ok(min <= max, `valid range @${shell}`);
    assert.equal(clampRadioWidth(shell, Number.NEGATIVE_INFINITY), min);
    assert.equal(clampRadioWidth(shell, Number.POSITIVE_INFINITY), max);
    assert.ok(getDefaultWidth(shell) >= min && getDefaultWidth(shell) <= max);
  }
});

test("sidebar width cannot invade the minimum Studio lane", () => {
  assert.equal(clampRadioWidth(1440, 650), 650);
  assert.equal(clampRadioWidth(1440, 1500), 768);
  assert.equal(getMaxRadioWidth(640), getMinRadioWidth(640));
});
