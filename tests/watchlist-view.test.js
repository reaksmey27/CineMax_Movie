import assert from "node:assert/strict";
import test from "node:test";
import { getWatchlistView } from "../src/pages/watchlist/watchlistView.js";

const movies = [
  { id: 1, title: "Zodiac", rating: "7.5", savedAt: "2026-01-01" },
  {
    id: 2,
    title: "Alien",
    rating: "8.5",
    watched: true,
    savedAt: "2026-02-01",
  },
  {
    id: 3,
    title: "Aliens",
    rating: "8.0",
    watched: false,
    savedAt: "2026-03-01",
  },
];
const ids = (items) => items.map((movie) => movie.id);
test("watchlist combines case-insensitive title search and watched status", () => {
  assert.deepEqual(
    ids(getWatchlistView(movies, " ALIEN ", "all", "title")),
    [2, 3],
  );
  assert.deepEqual(
    ids(getWatchlistView(movies, "alien", "unwatched", "title")),
    [3],
  );
  assert.deepEqual(
    ids(getWatchlistView(movies, "", "unwatched", "title")),
    [3, 1],
  );
  assert.deepEqual(ids(getWatchlistView(movies, "", "watched", "title")), [2]);
  assert.equal(getWatchlistView(movies, "missing", "all", "title").length, 0);
});
test("watchlist sorts without mutating saved collection", () => {
  assert.deepEqual(
    ids(getWatchlistView(movies, "", "all", "saved")),
    [3, 2, 1],
  );
  assert.deepEqual(
    ids(getWatchlistView(movies, "", "all", "rating")),
    [2, 3, 1],
  );
  assert.deepEqual(ids(movies), [1, 2, 3]);
});
