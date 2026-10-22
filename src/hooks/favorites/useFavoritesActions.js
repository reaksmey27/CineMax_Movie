import { useRemovalUndo } from "../../context/RemovalUndoContext";
import { useCallback, useMemo, useState } from "react";

export default function useFavoritesActions({
  favorites,
  userId,
  onRequireSignIn,
  showNotification,
}) {
  const offerUndo = useRemovalUndo();
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState(() => new Set());

  const favoriteIds = useMemo(
    () => new Set(favorites.map((movie) => movie.id)),
    [favorites],
  );

  const isSavingFavorite = useCallback(
    (movieId) => pendingFavoriteIds.has(movieId),
    [pendingFavoriteIds],
  );

  const addToFavorites = useCallback(
    async (movie) => {
      if (!userId) {
        onRequireSignIn("Sign in to save movies to your favorites.", movie);
        return false;
      }

      if (favoriteIds.has(movie.id)) {
        showNotification(
          `${movie.title} is already in your favorites.`,
          "info",
          movie,
        );
        return false;
      }

      if (pendingFavoriteIds.has(movie.id)) {
        return false;
      }

      setPendingFavoriteIds((previous) => new Set(previous).add(movie.id));
      try {
        const [{ db }, { addToFavorites: addMovieToFavorites }] =
          await Promise.all([
            import("../../firebase/firestore"),
            import("../../firebase/favorites"),
          ]);
        await addMovieToFavorites(db, userId, movie);
        showNotification(
          `${movie.title} added to your favorites.`,
          "success",
          movie,
        );
        return true;
      } catch (saveError) {
        console.error("[favorites] Failed to add movie", saveError);
        showNotification(
          "We couldn't add that movie to your favorites.",
          "error",
          movie,
        );
        return false;
      } finally {
        setPendingFavoriteIds((previous) => {
          const next = new Set(previous);
          next.delete(movie.id);
          return next;
        });
      }
    },
    [
      favoriteIds,
      onRequireSignIn,
      pendingFavoriteIds,
      showNotification,
      userId,
    ],
  );

  const removeFromFavorites = useCallback(
    async (movieId) => {
      if (!userId) {
        onRequireSignIn(
          "Sign in to manage your favorites.",
          favorites.find((favorite) => favorite.id === movieId),
        );
        return false;
      }

      const movie = favorites.find((favorite) => favorite.id === movieId);
      if (!movie) {
        return false;
      }

      if (pendingFavoriteIds.has(movieId)) {
        return false;
      }

      setPendingFavoriteIds((previous) => new Set(previous).add(movieId));
      try {
        const [{ db }, { removeFromFavorites: removeMovieFromFavorites }] =
          await Promise.all([
            import("../../firebase/firestore"),
            import("../../firebase/favorites"),
          ]);
        const removed = await removeMovieFromFavorites(db, userId, movieId);
        if (!removed) return false;
        offerUndo("favorites", movie);
        showNotification(
          `Removed ${movie.title} from favorites.`,
          "info",
          movie,
        );
        return true;
      } catch (removeError) {
        console.error("[favorites] Failed to remove movie", removeError);
        showNotification(
          "We couldn't remove that movie right now.",
          "error",
          movie,
        );
        return false;
      } finally {
        setPendingFavoriteIds((previous) => {
          const next = new Set(previous);
          next.delete(movieId);
          return next;
        });
      }
    },
    [
      offerUndo,
      favorites,
      onRequireSignIn,
      pendingFavoriteIds,
      showNotification,
      userId,
    ],
  );

  const isFavorite = useCallback(
    (movieId) => favoriteIds.has(movieId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (movie) => {
      if (favoriteIds.has(movie.id)) {
        return removeFromFavorites(movie.id);
      }

      return addToFavorites(movie);
    },
    [addToFavorites, favoriteIds, removeFromFavorites],
  );

  return { isSavingFavorite, removeFromFavorites, isFavorite, toggleFavorite };
}
