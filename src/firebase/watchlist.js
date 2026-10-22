import { createMovieCollection } from "./movieCollection.js";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

export const WATCHLISTS_COLLECTION = "watchlists";

// ─── Collection: watchlist collection setup ───────────────────────────────────

const watchlist = createMovieCollection({
  collectionName: WATCHLISTS_COLLECTION,
  missingUserMessage: "A signed-in user is required to save a watchlist.",
  invalidMovieMessage: "A valid movie is required to save a watchlist item.",
  isValidMovieId: (movieId) => Boolean(movieId),
});

// ─── Exports: watchlist API for components ────────────────────────────────────

export const getWatchlistMovies = watchlist.getMovies;
export const addToWatchlist = watchlist.addMovie;
export const removeFromWatchlist = watchlist.removeMovie;

export async function setWatchlistWatched(database, userId, movieId, watched) {
  if (
    !userId ||
    !Number.isSafeInteger(movieId) ||
    movieId <= 0 ||
    typeof watched !== "boolean"
  ) {
    throw new Error(
      "A signed-in user, valid movie and watched status are required.",
    );
  }
  const reference = doc(database, WATCHLISTS_COLLECTION, userId);
  return runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists() || !snapshot.data().movies?.[movieId]) return false;
    transaction.update(reference, {
      [`movies.${movieId}.watched`]: watched,
      updatedAt: serverTimestamp(),
    });
    return true;
  });
}
