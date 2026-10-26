import assert from "node:assert/strict";
import test from "node:test";
import {
  collectRadioFlipSnapshot,
  animateRadioFlip
} from "../src/components/studio-radio/radio-flip-motion.ts";

function movingElement(name, initialRect) {
  let rect = initialRect;
  const calls = [];
  const animation = { id: "", finished: new Promise(() => {}), cancel() {} };
  return {
    dataset: { radioMotionKey: name },
    calls,
    getBoundingClientRect: () => rect,
    updateRect: (next) => { rect = next; },
    animate(frames, options) {
      calls.push({ frames, options });
      return animation;
    },
    animation
  };
}

test("fullscreen FLIP captures named surfaces, ignores transport and uses current geometry", () => {
  const cover = movingElement("cover", { left: 10, top: 20, width: 120, height: 80 });
  const transport = movingElement("transport", { left: 20, top: 30, width: 10, height: 10 });
  const panel = { querySelectorAll: () => [cover, transport] };
  const before = collectRadioFlipSnapshot(panel);
  assert.equal(before.size, 1);
  assert.deepEqual(before.get("cover"), { left: 10, top: 20, width: 120, height: 80 });
  assert.equal(before.has("transport"), false);
  cover.updateRect({ left: 80, top: 40, width: 90, height: 75 });
  assert.deepEqual(before.get("cover"), { left: 10, top: 20, width: 120, height: 80 });
});

test("opening FLIP retains displacement, scaling, timing, easing and animation identity", () => {
  const progress = movingElement("progress", { left: 100, top: 50, width: 120, height: 60 });
  const panel = { querySelectorAll: () => [progress] };
  const before = collectRadioFlipSnapshot(panel);
  progress.updateRect({ left: 130, top: 40, width: 80, height: 40 });
  const animations = animateRadioFlip(panel, before, "opening");
  assert.equal(animations.length, 1);
  assert.equal(animations[0].id, "cm-radio-layout-progress");
  assert.deepEqual(progress.calls[0], {
    frames: [
      { transform: "translate3d(-30px, 10px, 0) scale(1.5, 1.5)", transformOrigin: "0 0" },
      { transform: "translate3d(0, 0, 0) scale(1, 1)", transformOrigin: "0 0" }
    ],
    options: {
      duration: 560,
      delay: 55,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both"
    }
  });
});

test("closing FLIP uses fallback timings for custom surfaces and ignores unchanged geometry", () => {
  const custom = movingElement("custom-key", { left: 8, top: 12, width: 100, height: 60 });
  const panel = { querySelectorAll: () => [custom] };
  const before = collectRadioFlipSnapshot(panel);
  assert.equal(animateRadioFlip(panel, before, "closing").length, 0);
  custom.updateRect({ left: 10, top: 22, width: 90, height: 50 });
  const animations = animateRadioFlip(panel, before, "closing");
  assert.equal(animations.length, 1);
  assert.equal(custom.calls[0].options.delay, 80);
  assert.equal(custom.calls[0].options.duration, 640);
  assert.equal(custom.calls[0].options.easing, "cubic-bezier(0.4, 0, 0.2, 1)");
});
