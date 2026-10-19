import { createMovieCollection } from "./movieCollection.js";

export const FAVORITES_COLLECTION = "favorites";

const favorites = createMovieCollection({
  collectionName: FAVORITES_COLLECTION,
  missingUserMessage: "A signed-in user is required to save a favorite.",
  invalidMovieMessage: "A valid movie is required to save a favorite.",
});

export const getFavoriteMovies = favorites.getMovies;
export const addToFavorites = favorites.addMovie;
export const removeFromFavorites = favorites.removeMovie;
