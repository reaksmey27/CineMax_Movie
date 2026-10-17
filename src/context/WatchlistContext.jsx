/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";

const WatchlistContext = createContext();

const WatchlistSessionProvider = ({
  children,
  onRequireSignIn,
  showNotification,
  userId,
}) => {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(userId));
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setRetryVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let cancelled = false;
    let unsubscribe;

    const subscribe = async () => {
      try {
        const [firestore, { db }, watchlistModule] = await Promise.all([
          import("firebase/firestore"),
          import("../firebase/firestore"),
          import("../firebase/watchlist"),
        ]);

        if (cancelled) {
          return;
        }

        const watchlistDocRef = firestore.doc(
          db,
          watchlistModule.WATCHLISTS_COLLECTION,
          userId,
        );
        unsubscribe = firestore.onSnapshot(
          watchlistDocRef,
          (snapshot) => {
            setWatchlist(watchlistModule.getWatchlistMovies(snapshot));
            setError(false);
            setLoading(false);
          },
          (subscriptionError) => {
            console.error("[watchlist] Failed to subscribe", subscriptionError);
            setError(true);
            setLoading(false);
            showNotification(
              "We couldn't sync your watchlist right now.",
              "error",
            );
          },
        );
      } catch (subscriptionError) {
        if (cancelled) {
          return;
        }

        console.error(
          "[watchlist] Failed to initialize subscription",
          subscriptionError,
        );
        setError(true);
        setLoading(false);
        showNotification("We couldn't sync your watchlist right now.", "error");
      }
    };

    subscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [showNotification, userId, retryVersion]);

  const watchlistIds = useMemo(
    () => new Set(watchlist.map((movie) => movie.id)),
    [watchlist],
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!userId) {
        onRequireSignIn("Sign in to save movies to your watchlist.");
        return false;
      }

      if (watchlistIds.has(movie.id)) {
        showNotification(
          `${movie.title} is already in your watchlist.`,
          "info",
        );
        return false;
      }

      try {
        const [{ db }, { addToWatchlist: addMovieToWatchlist }] =
          await Promise.all([
            import("../firebase/firestore"),
            import("../firebase/watchlist"),
          ]);
        await addMovieToWatchlist(db, userId, movie);
        showNotification(`${movie.title} added to your watchlist.`, "success");
        return true;
      } catch (error) {
        console.error("[watchlist] Failed to add movie", error);
        showNotification(
          "We couldn't add that movie to your watchlist.",
          "error",
        );
        return false;
      }
    },
    [onRequireSignIn, showNotification, userId, watchlistIds],
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!userId) {
        onRequireSignIn("Sign in to manage your watchlist.");
        return false;
      }

      const movie = watchlist.find(
        (watchlistMovie) => watchlistMovie.id === movieId,
      );
      if (!movie) {
        return false;
      }

      try {
        const [{ db }, { removeFromWatchlist: removeMovieFromWatchlist }] =
          await Promise.all([
            import("../firebase/firestore"),
            import("../firebase/watchlist"),
          ]);
        await removeMovieFromWatchlist(db, userId, movieId);
        showNotification(`Removed ${movie.title} from your watchlist.`, "info");
        return true;
      } catch (error) {
        console.error("[watchlist] Failed to remove movie", error);
        showNotification("We couldn't remove that movie right now.", "error");
        return false;
      }
    },
    [onRequireSignIn, showNotification, userId, watchlist],
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

  const value = useMemo(
    () => ({
      watchlist,
      loading,
      error,
      retry,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
    }),
    [
      addToWatchlist,
      isInWatchlist,
      loading,
      error,
      retry,
      removeFromWatchlist,
      toggleWatchlist,
      watchlist,
    ],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = user?.uid || null;
  const onRequireSignIn = useCallback(
    (message) => {
      showNotification(message, "info");
      navigate("/login", {
        state: { backgroundLocation: location },
      });
    },
    [location, navigate, showNotification],
  );

  return (
    <WatchlistSessionProvider
      key={userId || "guest"}
      onRequireSignIn={onRequireSignIn}
      showNotification={showNotification}
      userId={userId}
    >
      {children}
    </WatchlistSessionProvider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
};
