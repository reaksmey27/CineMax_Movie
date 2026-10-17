import {
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

export const FAVORITES_COLLECTION = "favorites";

const buildFavoritesDocRef = (userId) => doc(db, FAVORITES_COLLECTION, userId);

const normalizeMovieForFavorites = (movie) => ({
  id: movie.id,
  title: movie.title || "",
  subtitle: movie.subtitle || "",
  rating: movie.rating || "0.0",
  genres: Array.isArray(movie.genres) ? movie.genres.filter(Boolean) : [],
  description: movie.description || "",
  image: movie.image || movie.posterImage || "",
  posterImage: movie.posterImage || movie.image || "",
  backdropImage: movie.backdropImage || "",
  trailerKey: movie.trailerKey || null,
});

export const getFavoriteMovies = (snapshot) => {
  if (!snapshot.exists()) {
    return [];
  }

  const movies = Object.values(snapshot.data()?.movies || {});

  return movies.sort(
    (firstMovie, secondMovie) =>
      new Date(secondMovie.savedAt || 0).getTime() -
      new Date(firstMovie.savedAt || 0).getTime(),
  );
};

export const addToFavorites = async (userId, movie) => {
  if (!userId) {
    throw new Error("A signed-in user is required to save a favorite.");
  }

  if (movie?.id === undefined || movie?.id === null) {
    throw new Error("A valid movie is required to save a favorite.");
  }

  const favoritesDocRef = buildFavoritesDocRef(userId);
  const normalizedMovie = normalizeMovieForFavorites(movie);

  await setDoc(
    favoritesDocRef,
    {
      userId,
      movies: {
        [movie.id]: {
          ...normalizedMovie,
          savedAt: new Date().toISOString(),
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return normalizedMovie;
};

export const removeFromFavorites = async (userId, movieId) => {
  if (!userId || movieId === undefined || movieId === null) {
    return false;
  }

  const favoritesDocRef = buildFavoritesDocRef(userId);

  try {
    await updateDoc(favoritesDocRef, {
      [`movies.${movieId}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    if (error?.code === "not-found") {
      return false;
    }

    throw error;
  }
};
