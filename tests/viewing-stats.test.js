import test from "node:test";
import assert from "node:assert/strict";
import { getViewingStats } from "../src/pages/profile/utils/viewingStats.js";

test("statistics count completed movies and known runtimes without double counting", () => {
  const stats = getViewingStats([
    {
      completed: true,
      runtimeMinutes: 120,
      durationSeconds: 9000,
      genres: ["Drama", "Drama", "Action"],
    },
    { completed: true, durationSeconds: 3600, genres: ["Drama"] },
    { completed: false, runtimeMinutes: 180, genres: ["Comedy"] },
    { completed: true },
    {
      completed: true,
      runtimeMinutes: -10,
      durationSeconds: NaN,
      genres: [null, ""],
    },
  ]);
  assert.deepEqual(stats, {
    watched: 4,
    hours: 3,
    genres: [
      ["Drama", 2],
      ["Action", 1],
    ],
  });
  assert.deepEqual(getViewingStats([]), { watched: 0, hours: 0, genres: [] });
});
