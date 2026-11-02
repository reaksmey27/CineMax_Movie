import assert from "node:assert/strict";
import test from "node:test";
import { parseMovieSearchParams } from "../src/hooks/movies/movieSearchParams.js";

test("runtime choices persist in URLs and invalid values are ignored", () => {
  for (const runtime of ["short", "medium", "long"]) {
    const parsed = parseMovieSearchParams(new URLSearchParams({ runtime }));
    assert.equal(parsed.runtime, runtime);
    assert.equal(parsed.hasActiveFilters, true);
  }
  const invalid = parseMovieSearchParams(
    new URLSearchParams({ runtime: "unknown" }),
  );
  assert.equal(invalid.runtime, "");
  assert.equal(invalid.hasActiveFilters, false);
});

test("invalid page parameters fall back to the first page", () => {
  for (const value of [
    "",
    "abc",
    "0",
    "-2",
    "1.5",
    "2junk",
    "Infinity",
    "9007199254740992",
    "101",
    "999999",
  ]) {
    assert.equal(
      parseMovieSearchParams(new URLSearchParams({ page: value })).page,
      1,
      value,
    );
  }
});

test("malformed genre and out-of-range ratings are ignored", () => {
  for (const genre of ["28junk", "28.5", "-28", "0", "9007199254740992"]) {
    const filters = parseMovieSearchParams(new URLSearchParams({ genre }));
    assert.equal(filters.selectedGenre, null, genre);
    assert.equal(filters.hasActiveFilters, false);
  }
  for (const rating of ["11", "999", "-1", "7junk", "Infinity"]) {
    const filters = parseMovieSearchParams(new URLSearchParams({ rating }));
    assert.equal(filters.minRating, "", rating);
    assert.equal(filters.hasActiveFilters, false);
  }
  assert.equal(
    parseMovieSearchParams(new URLSearchParams({ page: "100", rating: "10" }))
      .page,
    100,
  );
  assert.equal(
    parseMovieSearchParams(new URLSearchParams({ rating: "10" })).minRating,
    "10",
  );
});

test("valid pagination preserves collection and search filters", () => {
  const filters = parseMovieSearchParams(
    new URLSearchParams({
      page: "3",
      collection: "top-rated",
      q: "Alien",
      genre: "27",
      year: "2025",
      rating: "7.5",
    }),
  );
  assert.equal(filters.page, 3);
  assert.equal(filters.collectionTitle, "Top Rated");
  assert.equal(filters.searchQuery, "Alien");
  assert.equal(filters.selectedGenre, 27);
  assert.equal(filters.releaseYear, "2025");
  assert.equal(filters.minRating, "7.5");
  assert.equal(filters.hasActiveFilters, true);
});
