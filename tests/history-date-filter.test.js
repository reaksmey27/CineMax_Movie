import test from "node:test";
import assert from "node:assert/strict";
import { matchesHistoryDate } from "../src/pages/history/utils/historyDateFilter.js";

test("history ranges use local midnight, Monday and month boundaries", () => {
  const now = new Date(2026, 10, 4, 12);
  const date = (day, hour = 0) => new Date(2026, 10, day, hour).toISOString();
  assert.equal(matchesHistoryDate(date(4), "today", now), true);
  assert.equal(matchesHistoryDate(date(3, 23), "today", now), false);
  assert.equal(matchesHistoryDate(date(2), "week", now), true);
  assert.equal(matchesHistoryDate(date(1), "week", now), false);
  assert.equal(matchesHistoryDate(date(1), "month", now), true);
  assert.equal(matchesHistoryDate(date(0, 23), "month", now), false);
  assert.equal(matchesHistoryDate(date(5), "today", now), false);
  assert.equal(matchesHistoryDate(undefined, "today", now), false);
  assert.equal(matchesHistoryDate("invalid", "month", now), false);
  assert.equal(matchesHistoryDate("invalid", "all", now), true);
});

test("week ranges cross years and retain Sunday in the same week", () => {
  const now = new Date(2027, 0, 3, 12);
  assert.equal(
    matchesHistoryDate(new Date(2026, 11, 28).toISOString(), "week", now),
    true,
  );
  assert.equal(
    matchesHistoryDate(new Date(2026, 11, 27, 23).toISOString(), "week", now),
    false,
  );
});
