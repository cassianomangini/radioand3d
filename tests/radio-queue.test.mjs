import assert from "node:assert/strict";
import test from "node:test";
import { RadioQueue } from "../src/features/radio/queue.ts";

test("the announced ten tracks are the next ten advances", () => {
  const queue = new RadioQueue(Array.from({ length: 12 }, (_, index) => `track-${index}`));
  const announced = queue.upcoming(10);

  assert.equal(announced.length, 10);
  assert.deepEqual(
    Array.from({ length: 10 }, () => queue.next()),
    announced
  );
  assert.deepEqual(queue.upcoming(10), ["track-11"]);
});

test("shuffle keeps its displayed sequence and does not repeat before the cycle ends", () => {
  const queue = new RadioQueue(["a", "b", "c", "d"], "a", () => 0.25);
  queue.setShuffle(true);
  const announced = queue.upcoming(10);

  assert.equal(announced.length, 3);
  assert.deepEqual(new Set(announced), new Set(["b", "c", "d"]));
  assert.deepEqual([queue.next(), queue.next(), queue.next()], announced);
  assert.equal(queue.next(), null);
});

test("repeat all exposes future cycles while repeat one repeats naturally", () => {
  const queue = new RadioQueue(["a", "b"], "a");
  queue.setRepeat("all");
  assert.deepEqual(queue.upcoming(5), ["b", "a", "b", "a", "b"]);
  assert.deepEqual([queue.next(), queue.next()], ["b", "a"]);

  queue.setRepeat("one");
  assert.deepEqual(queue.upcoming(3), ["a", "a", "a"]);
  assert.equal(queue.next(), "a");
  assert.equal(queue.next(true), "b");
});

test("one track can repeat in shuffle without inventing another title", () => {
  const queue = new RadioQueue(["only"]);
  queue.setShuffle(true);
  queue.setRepeat("all");
  assert.deepEqual(queue.upcoming(10), Array(10).fill("only"));
  assert.equal(queue.next(), "only");
});

test("previous restarts after three seconds and otherwise returns heard history", () => {
  const queue = new RadioQueue(["a", "b", "c"]);
  assert.equal(queue.next(), "b");
  assert.deepEqual(queue.previous(4), { id: "b", restart: true });
  assert.deepEqual(queue.previous(2), { id: "a", restart: false });
  assert.equal(queue.next(), "b");
});

test("withdrawn tracks leave the queue and current selection stays when eligible", () => {
  const queue = new RadioQueue(["a", "b", "c"], "b");
  queue.setTracks(["b", "d"]);
  assert.equal(queue.currentId, "b");
  assert.deepEqual(queue.upcoming(), ["d"]);
  queue.setTracks(["d"]);
  assert.equal(queue.currentId, "d");
  assert.deepEqual(queue.upcoming(), []);
});
