import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after, before, beforeEach } from "node:test";
import { doc, getDoc } from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addToFavorites,
  FAVORITES_COLLECTION,
  getFavoriteMovies,
} from "../src/firebase/favorites.js";
import {
  addToWatchlist,
  getWatchlistMovies,
  WATCHLISTS_COLLECTION,
} from "../src/firebase/watchlist.js";

const PROJECT_ID = "demo-movie-website";
const OWNER_UID = "movie-fan-1";
const OTHER_UID = "movie-fan-2";
const MOVIE = {
  id: 550,
  title: "Fight Club",
  subtitle: "1999",
  rating: "8.8",
  genres: ["Drama"],
  description: "A movie description.",
  image: "https://example.com/poster.jpg",
  posterImage: "https://example.com/poster.jpg",
  backdropImage: "https://example.com/backdrop.jpg",
  trailerKey: "trailer-key",
};
const SECOND_MOVIE = {
  ...MOVIE,
  id: 551,
  title: "The Big Lebowski",
};

let environment;

before(async () => {
  const rules = await readFile(new URL("../firestore.rules", import.meta.url), {
    encoding: "utf8",
  });

  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

after(async () => {
  await environment?.cleanup();
});

const testSavedCollection = ({ collection, addMovie, getMovies, name }) => {
  test(`${name} saves and reloads movies for the signed-in owner`, async () => {
    const database = environment.authenticatedContext(OWNER_UID).firestore();

    await addMovie(database, OWNER_UID, MOVIE);
    await addMovie(database, OWNER_UID, SECOND_MOVIE);

    const snapshot = await getDoc(doc(database, collection, OWNER_UID));
    const movies = getMovies(snapshot);

    assert.equal(snapshot.exists(), true);
    assert.equal(snapshot.data().userId, OWNER_UID);
    assert.equal(movies.length, 2);
    assert.deepEqual(
      movies.map(({ id }) => id).sort((first, second) => first - second),
      [MOVIE.id, SECOND_MOVIE.id],
    );
    assert.equal(movies.find(({ id }) => id === MOVIE.id).title, MOVIE.title);
    assert.equal(
      movies.find(({ id }) => id === MOVIE.id).posterImage,
      MOVIE.posterImage,
    );
    assert.ok(movies.every(({ savedAt }) => savedAt));
  });

  test(`${name} denies another user reads and writes`, async () => {
    const ownerDatabase = environment
      .authenticatedContext(OWNER_UID)
      .firestore();
    const otherDatabase = environment
      .authenticatedContext(OTHER_UID)
      .firestore();

    await addMovie(ownerDatabase, OWNER_UID, MOVIE);

    await assert.rejects(
      getDoc(doc(otherDatabase, collection, OWNER_UID)),
      /permission-denied/i,
    );
    await assert.rejects(
      addMovie(otherDatabase, OWNER_UID, {
        ...MOVIE,
        id: 999,
        title: "Unauthorized movie",
      }),
      /permission-denied/i,
    );
  });
};

testSavedCollection({
  collection: FAVORITES_COLLECTION,
  addMovie: addToFavorites,
  getMovies: getFavoriteMovies,
  name: "Favorites",
});

testSavedCollection({
  collection: WATCHLISTS_COLLECTION,
  addMovie: addToWatchlist,
  getMovies: getWatchlistMovies,
  name: "Watchlist",
});
