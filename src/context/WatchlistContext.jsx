/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import { db } from "../firebase/config";
import {
  addToWatchlist as addMovieToWatchlist,
  getWatchlistMovies,
  removeFromWatchlist as removeMovieFromWatchlist,
  WATCHLISTS_COLLECTION,
} from "../firebase/watchlist";

const WatchlistContext = createContext();

const WatchlistSessionProvider = ({ children, showNotification, userId }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(userId));

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const watchlistDocRef = doc(db, WATCHLISTS_COLLECTION, userId);
    const unsubscribe = onSnapshot(
      watchlistDocRef,
      (snapshot) => {
        setWatchlist(getWatchlistMovies(snapshot));
        setLoading(false);
      },
      (error) => {
        console.error("[watchlist] Failed to subscribe", error);
        setLoading(false);
        showNotification("We couldn't sync your watchlist right now.", "error");
      },
    );

    return unsubscribe;
  }, [showNotification, userId]);

  const watchlistIds = useMemo(
    () => new Set(watchlist.map((movie) => movie.id)),
    [watchlist],
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!userId) {
        showNotification("Sign in to save movies to your watchlist.", "info");
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
        await addMovieToWatchlist(userId, movie);
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
    [showNotification, userId, watchlistIds],
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!userId) {
        showNotification("Sign in to manage your watchlist.", "info");
        return false;
      }

      const movie = watchlist.find(
        (watchlistMovie) => watchlistMovie.id === movieId,
      );
      if (!movie) {
        return false;
      }

      try {
        await removeMovieFromWatchlist(userId, movieId);
        showNotification(`Removed ${movie.title} from your watchlist.`, "info");
        return true;
      } catch (error) {
        console.error("[watchlist] Failed to remove movie", error);
        showNotification("We couldn't remove that movie right now.", "error");
        return false;
      }
    },
    [showNotification, userId, watchlist],
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
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
    }),
    [
      addToWatchlist,
      isInWatchlist,
      loading,
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
  const userId = user?.uid || null;

  return (
    <WatchlistSessionProvider
      key={userId || "guest"}
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
