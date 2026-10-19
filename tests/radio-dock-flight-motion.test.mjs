import assert from "node:assert/strict";
import test from "node:test";
import {
  RADIO_DOCK_FLIGHT_MS,
  getRadioDockFlightKeyframes,
  getRadioDockNavShift,
  startRadioDockWaapi
} from "../src/components/studio-radio/radio-dock-flight-motion.ts";

const source = { left: 1000, top: 0, width: 430, height: 900 };
const target = { left: 460, top: 8, width: 350, height: 60 };

test("WAAPI flight to navbar keeps original timing, easing geometry and trailing lane", () => {
  assert.equal(RADIO_DOCK_FLIGHT_MS, 660);
  assert.deepEqual(getRadioDockFlightKeyframes(source, target, 80, true), [
    { left: "1000px", top: "0px", width: "430px", height: "900px", borderRadius: "0px", opacity: 0.98 },
    { left: "540px", top: "8px", width: "350px", height: "60px", borderRadius: "12px", opacity: 0.96 }
  ]);
  assert.deepEqual(getRadioDockFlightKeyframes(target, source, 0, false), [
    { left: "460px", top: "8px", width: "350px", height: "60px", borderRadius: "12px", opacity: 0.98 },
    { left: "1000px", top: "0px", width: "430px", height: "900px", borderRadius: "0px", opacity: 0.96 }
  ]);
});

test("nav drift animates only when the header actually reflows", () => {
  assert.equal(getRadioDockNavShift(400, 340), 60);
  assert.equal(getRadioDockNavShift(340, 400), -60);
  assert.equal(getRadioDockNavShift(400, 399.2), null);
  assert.equal(getRadioDockNavShift(400, 401), null);
});

test("WAAPI controller animates the same two surfaces without creating audio or timers", () => {
  const navCalls = [];
  const flightCalls = [];
  const originalWindow = globalThis.window;
  globalThis.window = { innerWidth: 1440 };
  try {
    const nav = {
      getBoundingClientRect: () => ({ left: 360 }),
      animate(frames, options) {
        navCalls.push({ frames, options });
        return { finished: Promise.resolve() };
      }
    };
    const flight = {
      style: { display: "none", visibility: "hidden" },
      animate(frames, options) {
        flightCalls.push({ frames, options });
        return { finished: Promise.resolve() };
      }
    };
    const header = { getBoundingClientRect: () => ({ right: 1320 }) };
    const result = startRadioDockWaapi({
      nav, navFrom: { left: 390 }, flight, from: source,
      destination: target, header, docking: true
    });
    assert.equal(navCalls.length, 1);
    assert.deepEqual(navCalls[0].frames, [
      { transform: "translateX(30px)" }, { transform: "translateX(0)" }
    ]);
    assert.equal(flightCalls.length, 1);
    assert.deepEqual(flightCalls[0].frames, getRadioDockFlightKeyframes(source, target, 120, true));
    assert.deepEqual(flightCalls[0].options, {
      duration: 660, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards"
    });
    assert.equal(flight.style.display, "block");
    assert.equal(flight.style.visibility, "visible");
    assert.ok(result.flightAnimation);
    assert.ok(result.navAnimation);
  } finally {
    globalThis.window = originalWindow;
  }
});
