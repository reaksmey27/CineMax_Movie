import assert from "node:assert/strict";
import test from "node:test";
import {
  upcomingDateBoundary,
  filterUpcomingMovies,
} from "../src/services/tmdb/upcomingMovies.js";

test("upcoming excludes released, today, missing and invalid dates", () => {
  const dates = [
    "2025-10-22",
    "2026-10-21",
    "2026-10-22",
    "2026-10-23",
    "2027-01-01",
    "",
    null,
    "2027-02-30",
    "2027-13-01",
    "2027-1-1",
    "not-a-date",
  ];
  const movies = dates.map((release_date, id) => ({ id, release_date }));
  assert.deepEqual(
    filterUpcomingMovies(movies, "2026-10-22").map((movie) => movie.id),
    [3, 4],
  );
  assert.equal(movies.length, dates.length);
});

test("date boundary uses the local calendar and handles year and leap-day rollovers", () => {
  assert.deepEqual(upcomingDateBoundary(new Date(2026, 11, 31, 23, 59)), {
    today: "2026-12-31",
    tomorrow: "2027-01-01",
  });
  assert.deepEqual(upcomingDateBoundary(new Date(2028, 1, 28, 0, 1)), {
    today: "2028-02-28",
    tomorrow: "2028-02-29",
  });
  assert.deepEqual(upcomingDateBoundary(new Date(2026, 9, 22, 0, 1)), {
    today: "2026-10-22",
    tomorrow: "2026-10-23",
  });
});
