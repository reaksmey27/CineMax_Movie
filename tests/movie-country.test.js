import assert from "node:assert/strict";
import test from "node:test";
import {
  MOVIE_COUNTRIES,
  movieCountryName,
} from "../src/config/movieCountries.js";
import { parseMovieSearchParams } from "../src/hooks/movies/movieSearchParams.js";
import { filteredSearch } from "../src/hooks/movies/filteredSearch.js";

test("country URL validation and menu exclude Thailand without a global exclusion", () => {
  assert.ok(MOVIE_COUNTRIES.includes("KH"));
  assert.ok(!MOVIE_COUNTRIES.includes("TH"));
  assert.equal(movieCountryName("JP", "en"), "Japan");
  const selected = parseMovieSearchParams(
    new URLSearchParams("country=KH&collection=top-rated"),
  );
  assert.equal(selected.country, "KH");
  assert.equal(selected.collection, "");
  assert.equal(selected.hasActiveFilters, true);
  for (const country of ["TH", "bad", ""]) {
    assert.equal(
      parseMovieSearchParams(new URLSearchParams({ country })).country,
      "",
    );
  }
});

test("country search combines pages, resolves origins and preserves unfiltered Thai movies", async () => {
  const movies = [
    { id: 1, title: "Thai movie", origin_country: ["TH"] },
    { id: 2, title: "Cambodian movie" },
    { id: 3, title: "Co-production", origin_country: ["FR", "KH"] },
  ];
  const fetchPage = async (page) => ({
    total_pages: 2,
    results: page === 1 ? movies.slice(0, 1) : movies.slice(1),
  });
  const requested = [];
  const filtered = await filteredSearch(
    fetchPage,
    { country: "KH", page: 1 },
    () => false,
    undefined,
    async (id) => {
      requested.push(id);
      return ["KH"];
    },
  );
  assert.deepEqual(
    filtered.results.map((movie) => movie.id),
    [2, 3],
  );
  assert.deepEqual(requested, [2]);
  const all = await filteredSearch(fetchPage, { page: 1 });
  assert.deepEqual(
    all.results.map((movie) => movie.id),
    [1, 2, 3],
  );
  await assert.rejects(
    filteredSearch(
      fetchPage,
      { country: "KH", page: 1 },
      () => false,
      undefined,
      async () => {
        throw Error("offline");
      },
    ),
    /offline/,
  );
});
