import assert from "node:assert/strict";
import test from "node:test";
import {
  getRemainingSeconds,
  formatRemainingDuration,
} from "../src/utils/player/finishTime.js";

test("finish estimate uses runtime or unfinished playback duration", () => {
  assert.equal(getRemainingSeconds(135), 8100);
  assert.equal(
    getRemainingSeconds(135, { durationSeconds: 7200, positionSeconds: 1800 }),
    5400,
  );
  assert.equal(
    getRemainingSeconds(135, { durationSeconds: 0, positionSeconds: 1800 }),
    6300,
  );
  assert.equal(
    getRemainingSeconds(135, {
      completed: true,
      durationSeconds: 7200,
      positionSeconds: 7200,
    }),
    8100,
  );
  assert.equal(
    getRemainingSeconds(undefined, {
      durationSeconds: 7200,
      positionSeconds: 60,
    }),
    7140,
  );
});
test("unknown and invalid durations never produce invalid finish times", () => {
  for (const runtime of [undefined, null, 0, -1, Infinity, NaN, 2000])
    assert.equal(getRemainingSeconds(runtime), null);
  assert.equal(getRemainingSeconds(120, { positionSeconds: -50 }), 7200);
  assert.equal(getRemainingSeconds(120, { positionSeconds: Infinity }), 7200);
  assert.equal(getRemainingSeconds(120, { positionSeconds: 9000 }), 0);
  assert.match(formatRemainingDuration(61, "en"), /2/);
});
