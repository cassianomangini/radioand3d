import assert from "node:assert/strict";
import test from "node:test";
import { RadioQueue, createShuffledQueue } from "../src/features/radio/queue.ts";

test("new radio playlist starts randomly and plays every entry once", () => {
  const ids = Array.from({ length: 20 }, (_, index) => `track-${index}`);
  const first = createShuffledQueue(ids, 123);
  const sameSeed = createShuffledQueue(ids, 123);
  const otherSeed = createShuffledQueue(ids, 456);
  const order = [first.currentId, ...first.upcoming(ids.length)];

  assert.deepEqual(order, [sameSeed.currentId, ...sameSeed.upcoming(ids.length)]);
  assert.notDeepEqual(order, [otherSeed.currentId, ...otherSeed.upcoming(ids.length)]);
  assert.equal(order.length, ids.length);
  assert.equal(new Set(order).size, ids.length);
  assert.deepEqual(Array.from({ length: ids.length - 1 }, () => first.next()), order.slice(1));
  assert.equal(first.next(), null);
});

test("manual selection does not put previously visited entries back into the automatic queue", () => {
  const queue = createShuffledQueue(["a", "b", "c", "d", "e"], 9);
  const order = [queue.currentId, ...queue.upcoming(5)];

  assert.equal(queue.next(), order[1]);
  assert.equal(queue.select(order[4]), true);
  const remaining = queue.upcoming(5);
  assert.deepEqual(new Set(remaining), new Set([order[2], order[3]]));
  assert.deepEqual([queue.next(), queue.next()], remaining);
  assert.equal(queue.next(), null);
});

test("repeat current track is opt-in and next skips to an unplayed entry", () => {
  const queue = createShuffledQueue(["a", "b", "c"], 7);
  const first = queue.currentId;

  queue.setRepeat("one");
  assert.deepEqual(queue.upcoming(1), [first]);
  assert.equal(queue.next(false), first);
  assert.equal(queue.hasNextManual, true);
  const next = queue.next(true);
  assert.notEqual(next, first);
  assert.equal(queue.next(false), next);
});

test("next returns to the track just left with previous, even while repeating", () => {
  const queue = createShuffledQueue(["a", "b", "c"], 11);
  const second = queue.next();
  queue.setRepeat("one");
  queue.previous(0);

  assert.equal(queue.hasNextManual, true);
  assert.equal(queue.next(true), second);
});

test("new order restarts the full playlist and turns repeat off", () => {
  const ids = ["a", "b", "c", "d"];
  const queue = createShuffledQueue(ids, 3);
  queue.next();
  const previous = queue.currentId;
  queue.setRepeat("one");

  queue.reshuffle(() => 0.5);
  const order = [queue.currentId, ...queue.upcoming(ids.length)];
  assert.notEqual(queue.currentId, previous);
  assert.equal(queue.repeat, "off");
  assert.equal(queue.hasPrevious, false);
  assert.equal(order.length, ids.length);
  assert.equal(new Set(order).size, ids.length);
  assert.deepEqual(queue.following(), order.slice(1));
});

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

test("played shuffle tracks move to the end of the list and stay selectable", () => {
  const queue = createShuffledQueue(["a", "b", "c", "d"], 21);
  const order = [queue.currentId, ...queue.upcoming(4)];

  assert.equal(queue.next(), order[1]);
  assert.deepEqual(queue.upcoming(4), order.slice(2));
  assert.deepEqual(queue.following(), [...order.slice(2), order[0]]);

  assert.equal(queue.next(), order[2]);
  assert.deepEqual(queue.following(), [...order.slice(3), order[0], order[1]]);
  assert.equal(queue.following().length, order.length - 1);
});

test("a finished shuffle cycle keeps heard tracks in the list without replaying them", () => {
  const queue = createShuffledQueue(["a", "b", "c"], 4);
  const order = [queue.currentId, ...queue.upcoming(3)];

  assert.equal(queue.next(), order[1]);
  assert.equal(queue.next(), order[2]);
  assert.equal(queue.next(), null);
  assert.equal(queue.hasNextManual, false);
  assert.deepEqual(queue.following(), [order[0], order[1]]);

  assert.equal(queue.select(order[0]), true);
  assert.equal(queue.currentId, order[0]);
  assert.deepEqual(queue.upcoming(3), []);
  assert.deepEqual(queue.following(), [order[1], order[2]]);
  assert.equal(queue.next(), null);
});

test("selecting a heard track keeps unplayed tracks ahead of the replay tail", () => {
  const queue = createShuffledQueue(["a", "b", "c", "d", "e"], 9);
  const order = [queue.currentId, ...queue.upcoming(5)];

  assert.equal(queue.next(), order[1]);
  assert.equal(queue.select(order[0]), true);

  const automatic = queue.upcoming(5);
  assert.deepEqual(new Set(automatic), new Set([order[2], order[3], order[4]]));
  assert.equal(automatic.includes(order[0]), false);
  assert.equal(automatic.includes(order[1]), false);
  assert.deepEqual(queue.following(), [...automatic, order[1]]);
});

test("previous keeps the track just left at the front of the shuffle list", () => {
  const queue = createShuffledQueue(["a", "b", "c", "d"], 11);
  const first = queue.currentId;
  const second = queue.next();

  queue.previous(0);

  assert.equal(queue.currentId, first);
  assert.equal(queue.following()[0], second);
  assert.equal(queue.following().includes(first), false);
  assert.equal(queue.next(), second);
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
