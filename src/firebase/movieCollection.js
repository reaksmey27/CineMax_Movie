import {
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// ─── Helpers: normalize movie & sort by saved date ────────────────────────────

const normalizeMovie = (movie) => ({
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

const sortBySavedAtDescending = (firstMovie, secondMovie) =>
  new Date(secondMovie.savedAt || 0).getTime() -
  new Date(firstMovie.savedAt || 0).getTime();

// ─── createMovieCollection: CRUD factory ──────────────────────────────────────

export const createMovieCollection = ({
  collectionName,
  missingUserMessage,
  invalidMovieMessage,
  isValidMovieId = (movieId) => movieId !== undefined && movieId !== null,
}) => {
  const buildDocumentReference = (database, userId) =>
    doc(database, collectionName, userId);

  const getMovies = (snapshot) => {
    if (!snapshot.exists()) {
      return [];
    }

    return Object.values(snapshot.data()?.movies || {}).sort(
      sortBySavedAtDescending,
    );
  };

  const addMovie = async (database, userId, movie) => {
    if (!userId) {
      throw new Error(missingUserMessage);
    }

    if (!isValidMovieId(movie?.id)) {
      throw new Error(invalidMovieMessage);
    }

    const documentReference = buildDocumentReference(database, userId);
    const normalizedMovie = normalizeMovie(movie);

    await setDoc(
      documentReference,
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

  const removeMovie = async (database, userId, movieId) => {
    if (!userId || !isValidMovieId(movieId)) {
      return false;
    }

    const documentReference = buildDocumentReference(database, userId);

    try {
      await updateDoc(documentReference, {
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

  return { getMovies, addMovie, removeMovie };
};
