import assert from "node:assert/strict";
import test from "node:test";
import { rankMovieSuggestions, suggestionQueries } from "../src/utils/movieSearchSuggestions.js";

test("suggestions handle typos and transpositions without unrelated titles", () => {
  const movies = ["Batman", "Batman", "Avatar", "Batmen"].map(title => ({ title }));
  assert.deepEqual(rankMovieSuggestions("batamn", movies), ["Batman"]);
  assert.deepEqual(rankMovieSuggestions("avatr", movies), ["Avatar"]);
  assert.deepEqual(rankMovieSuggestions("zzzzzz", movies), []);
  assert.deepEqual(rankMovieSuggestions("Batman", movies), ["Batmen"]);
  assert.deepEqual(rankMovieSuggestions("batmn", [{ title: "Batman", adult: true }]), []);
});

test("candidate searches are bounded and Unicode titles retain their letters", () => {
  assert.deepEqual(suggestionQueries("batamn"), ["bat"]);
  assert.deepEqual(suggestionQueries("a"), []);
  assert.deepEqual(suggestionQueries("x".repeat(81)), []);
  assert.deepEqual(rankMovieSuggestions("天空之成", [{ title: "天空之城" }]), ["天空之城"]);
});
