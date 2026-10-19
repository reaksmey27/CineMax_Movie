import { createMovieCollection } from "./movieCollection.js";

export const WATCHLISTS_COLLECTION = "watchlists";

const watchlist = createMovieCollection({
  collectionName: WATCHLISTS_COLLECTION,
  missingUserMessage: "A signed-in user is required to save a watchlist.",
  invalidMovieMessage: "A valid movie is required to save a watchlist item.",
  isValidMovieId: (movieId) => Boolean(movieId),
});

export const getWatchlistMovies = watchlist.getMovies;
export const addToWatchlist = watchlist.addMovie;
export const removeFromWatchlist = watchlist.removeMovie;
