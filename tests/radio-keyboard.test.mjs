import assert from "node:assert/strict";
import test from "node:test";
import { resolveRadioKeyboardCommand } from "../src/features/radio/radio-keyboard.ts";

test("maps desktop-style radio shortcuts to transport commands", () => {
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "Space" }), { type: "toggle" });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyK" }), { type: "toggle" });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyM" }), { type: "mute" });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyP" }), { type: "previous" });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyN" }), { type: "next" });
});

test("maps arrows and J/L to repeatable seek commands", () => {
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "ArrowLeft", repeat: true }), {
    type: "seek",
    seconds: -5
  });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "ArrowRight" }), {
    type: "seek",
    seconds: 5
  });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyJ" }), {
    type: "seek",
    seconds: -10
  });
  assert.deepEqual(resolveRadioKeyboardCommand({ code: "KeyL" }), {
    type: "seek",
    seconds: 10
  });
});

test("does not repeat destructive transport shortcuts while a key is held", () => {
  for (const code of ["Space", "KeyK", "KeyM", "KeyP", "KeyN"]) {
    assert.equal(resolveRadioKeyboardCommand({ code, repeat: true }), null);
  }
});

test("leaves browser and operating-system modifier shortcuts alone", () => {
  assert.equal(resolveRadioKeyboardCommand({ code: "KeyK", ctrlKey: true }), null);
  assert.equal(resolveRadioKeyboardCommand({ code: "KeyM", metaKey: true }), null);
  assert.equal(resolveRadioKeyboardCommand({ code: "ArrowLeft", altKey: true }), null);
  assert.equal(resolveRadioKeyboardCommand({ code: "KeyQ" }), null);
});
