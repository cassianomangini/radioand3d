import assert from "node:assert/strict";
import test from "node:test";
import {
  EQUALIZER_FREQUENCIES,
  appliedEqualizerGains,
  clampEqualizerGain,
  connectEqualizer,
  updateEqualizer
} from "../src/features/radio/equalizer.ts";

function fakeNode() {
  return {
    connections: [],
    connect(destination) {
      this.connections.push(destination);
    }
  };
}

test("equalizer clamps bands and preserves a flat bypass", () => {
  assert.equal(clampEqualizerGain(19), 12);
  assert.equal(clampEqualizerGain(-19), -12);
  assert.equal(clampEqualizerGain(Number.NaN), 0);
  assert.deepEqual(appliedEqualizerGains([4, -3], false), EQUALIZER_FREQUENCIES.map(() => 0));
  assert.deepEqual(appliedEqualizerGains([4, -3], true).slice(0, 3), [4, -3, 0]);
});

test("one audio source passes through ten filters and the analyser before output", () => {
  const source = fakeNode();
  const analyser = fakeNode();
  const destination = fakeNode();
  const filters = [];
  const context = {
    destination,
    createBiquadFilter() {
      const filter = {
        ...fakeNode(),
        frequency: { value: 0 },
        Q: { value: 0 },
        gain: {
          value: 0,
          targets: [],
          setTargetAtTime(value, time) {
            this.targets.push([value, time]);
          }
        }
      };
      filters.push(filter);
      return filter;
    }
  };

  const connected = connectEqualizer(context, source, analyser, [6, -4], true);
  assert.equal(connected[0], filters[0]);
  assert.equal(filters.length, 10);
  assert.deepEqual(filters.map((filter) => filter.frequency.value), EQUALIZER_FREQUENCIES);
  assert.deepEqual(filters.map((filter) => filter.type), EQUALIZER_FREQUENCIES.map(() => "peaking"));
  assert.deepEqual(filters.map((filter) => filter.gain.value).slice(0, 3), [6, -4, 0]);
  assert.deepEqual(source.connections, [filters[0]]);
  filters.slice(0, -1).forEach((filter, index) => assert.deepEqual(filter.connections, [filters[index + 1]]));
  assert.deepEqual(filters.at(-1).connections, [analyser]);
  assert.deepEqual(analyser.connections, [destination]);

  updateEqualizer(filters, [8, -2], false, 5);
  assert.deepEqual(filters.map((filter) => filter.gain.targets.at(-1)), EQUALIZER_FREQUENCIES.map(() => [0, 5]));
  updateEqualizer(filters, [8, -2], true, 6);
  assert.deepEqual(filters.slice(0, 2).map((filter) => filter.gain.targets.at(-1)), [[8, 6], [-2, 6]]);
});
