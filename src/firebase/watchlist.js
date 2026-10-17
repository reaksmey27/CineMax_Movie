import {
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const WATCHLISTS_COLLECTION = "watchlists";

const buildWatchlistDocRef = (database, userId) =>
  doc(database, WATCHLISTS_COLLECTION, userId);

const normalizeMovieForWatchlist = (movie) => ({
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

export const getWatchlistMovies = (snapshot) => {
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

export const addToWatchlist = async (database, userId, movie) => {
  if (!userId) {
    throw new Error("A signed-in user is required to save a watchlist.");
  }

  if (!movie?.id) {
    throw new Error("A valid movie is required to save a watchlist item.");
  }

  const watchlistDocRef = buildWatchlistDocRef(database, userId);
  const normalizedMovie = normalizeMovieForWatchlist(movie);

  await setDoc(
    watchlistDocRef,
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

export const removeFromWatchlist = async (database, userId, movieId) => {
  if (!userId || !movieId) {
    return false;
  }

  const watchlistDocRef = buildWatchlistDocRef(database, userId);

  try {
    await updateDoc(watchlistDocRef, {
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
