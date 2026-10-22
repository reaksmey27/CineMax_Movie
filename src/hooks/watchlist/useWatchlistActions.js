import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function useWatchlistActions({
  watchlist,
  userId,
  onRequireSignIn,
  showNotification,
}) {
  const { t } = useLanguage();
  const [pendingWatchlistIds, setPendingWatchlistIds] = useState(
    () => new Set(),
  );

  const watchlistIds = useMemo(
    () => new Set(watchlist.map((movie) => movie.id)),
    [watchlist],
  );

  const isSavingToWatchlist = useCallback(
    (movieId) => pendingWatchlistIds.has(movieId),
    [pendingWatchlistIds],
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!userId) {
        onRequireSignIn("Sign in to save movies to your watchlist.", movie);
        return false;
      }

      if (watchlistIds.has(movie.id)) {
        showNotification(
          `${movie.title} is already in your watchlist.`,
          "info",
          movie,
        );
        return false;
      }

      if (pendingWatchlistIds.has(movie.id)) {
        return false;
      }

      setPendingWatchlistIds((previous) => new Set(previous).add(movie.id));
      try {
        const [{ db }, { addToWatchlist: addMovieToWatchlist }] =
          await Promise.all([
            import("../../firebase/firestore"),
            import("../../firebase/watchlist"),
          ]);
        await addMovieToWatchlist(db, userId, movie);
        showNotification(
          `${movie.title} added to your watchlist.`,
          "success",
          movie,
        );
        return true;
      } catch (error) {
        console.error("[watchlist] Failed to add movie", error);
        showNotification(
          "We couldn't add that movie to your watchlist.",
          "error",
          movie,
        );
        return false;
      } finally {
        setPendingWatchlistIds((previous) => {
          const next = new Set(previous);
          next.delete(movie.id);
          return next;
        });
      }
    },
    [
      onRequireSignIn,
      pendingWatchlistIds,
      showNotification,
      userId,
      watchlistIds,
    ],
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!userId) {
        onRequireSignIn(
          "Sign in to manage your watchlist.",
          watchlist.find((watchlistMovie) => watchlistMovie.id === movieId),
        );
        return false;
      }

      const movie = watchlist.find(
        (watchlistMovie) => watchlistMovie.id === movieId,
      );
      if (!movie) {
        return false;
      }

      if (pendingWatchlistIds.has(movieId)) {
        return false;
      }

      setPendingWatchlistIds((previous) => new Set(previous).add(movieId));
      try {
        const [{ db }, { removeFromWatchlist: removeMovieFromWatchlist }] =
          await Promise.all([
            import("../../firebase/firestore"),
            import("../../firebase/watchlist"),
          ]);
        await removeMovieFromWatchlist(db, userId, movieId);
        showNotification(
          `Removed ${movie.title} from your watchlist.`,
          "info",
          movie,
        );
        return true;
      } catch (error) {
        console.error("[watchlist] Failed to remove movie", error);
        showNotification(
          "We couldn't remove that movie right now.",
          "error",
          movie,
        );
        return false;
      } finally {
        setPendingWatchlistIds((previous) => {
          const next = new Set(previous);
          next.delete(movieId);
          return next;
        });
      }
    },
    [onRequireSignIn, pendingWatchlistIds, showNotification, userId, watchlist],
  );

  const isInWatchlist = useCallback(
    (movieId) => watchlistIds.has(movieId),
    [watchlistIds],
  );

  const toggleWatchlist = useCallback(
    async (movie) => {
      if (watchlistIds.has(movie.id)) {
        return removeFromWatchlist(movie.id);
      }

      return addToWatchlist(movie);
    },
    [addToWatchlist, removeFromWatchlist, watchlistIds],
  );

  const setWatched = useCallback(
    async (movie, watched) => {
      if (!userId || pendingWatchlistIds.has(movie.id)) return false;
      setPendingWatchlistIds((previous) => new Set(previous).add(movie.id));
      try {
        const [{ db }, { setWatchlistWatched }] = await Promise.all([
          import("../../firebase/firestore"),
          import("../../firebase/watchlist"),
        ]);
        const updated = await setWatchlistWatched(
          db,
          userId,
          movie.id,
          watched,
        );
        if (!updated)
          showNotification(
            t("This movie is no longer in your watchlist."),
            "info",
            movie,
          );
        return updated;
      } catch (error) {
        console.error("[watchlist] Failed to update watched status", error);
        showNotification(
          t("We couldn't update watched status. Please try again."),
          "error",
          movie,
        );
        return false;
      } finally {
        setPendingWatchlistIds((previous) => {
          const next = new Set(previous);
          next.delete(movie.id);
          return next;
        });
      }
    },
    [pendingWatchlistIds, showNotification, userId, t],
  );

  return {
    setWatched,
    isSavingToWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
  };
}
