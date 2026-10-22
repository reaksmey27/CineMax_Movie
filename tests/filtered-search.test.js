import assert from "node:assert/strict";
import test from "node:test";
import { filteredSearch } from "../src/hooks/movies/filteredSearch.js";

test("combines pages before filtering, sorting and repaginating", async () => {
  const movies = Array.from({ length: 30 }, (_, id) => ({
    id,
    genre_ids: [18],
    vote_average: 8,
    popularity: id,
    release_date: "2025-01-01",
  }));
  const fetchPage = async (page) => ({
    total_pages: 2,
    results:
      page === 1
        ? [
            ...movies.slice(0, 15),
            { id: 100, genre_ids: [27], vote_average: 9 },
            { id: 101, genre_ids: [18], vote_average: 4 },
          ]
        : movies.slice(15),
  });
  const filters = {
    selectedGenre: 18,
    minRating: "7",
    releaseYear: "2025",
    sortBy: "popularity.desc",
    page: 1,
  };
  const first = await filteredSearch(fetchPage, filters);
  assert.equal(first.total_pages, 2);
  assert.deepEqual(
    first.results.map((movie) => movie.id),
    movies
      .slice(10)
      .reverse()
      .map((movie) => movie.id),
  );
  const second = await filteredSearch(fetchPage, { ...filters, page: 2 });
  assert.deepEqual(
    second.results.map((movie) => movie.id),
    movies
      .slice(0, 10)
      .reverse()
      .map((movie) => movie.id),
  );
});

test("cancellation stops additional batches", async () => {
  let calls = 0;
  const result = await filteredSearch(
    async () => {
      calls++;
      return { total_pages: 100, results: [] };
    },
    { page: 1 },
    () => true,
  );
  assert.equal(result, null);
  assert.equal(calls, 1);
});

test("limits requests, deduplicates movies and propagates failures", async () => {
  const requested = [];
  const response = await filteredSearch(
    async (page) => {
      requested.push(page);
      return { total_pages: 501, results: [{ id: 1 }] };
    },
    { page: 1 },
  );
  assert.equal(Math.max(...requested), 100);
  assert.equal(response.results.length, 1);
  await assert.rejects(
    filteredSearch(
      async (page) => {
        if (page === 2) throw new Error("Network error");
        return { total_pages: 2, results: [] };
      },
      { page: 1 },
    ),
    /Network error/,
  );
});
