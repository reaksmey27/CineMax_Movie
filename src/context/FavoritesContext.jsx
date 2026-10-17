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
  addToFavorites as addMovieToFavorites,
  FAVORITES_COLLECTION,
  getFavoriteMovies,
  removeFromFavorites as removeMovieFromFavorites,
} from "../firebase/favorites";

const FavoritesContext = createContext();

const FavoritesSessionProvider = ({ children, showNotification, userId }) => {
  const [favorites, setFavorites] = useState([]);
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

    const favoritesDocRef = doc(db, FAVORITES_COLLECTION, userId);
    const unsubscribe = onSnapshot(
      favoritesDocRef,
      (snapshot) => {
        setFavorites(getFavoriteMovies(snapshot));
        setError(false);
        setLoading(false);
      },
      (subscriptionError) => {
        console.error("[favorites] Failed to subscribe", subscriptionError);
        setError(true);
        setLoading(false);
        showNotification("We couldn't sync your favorites right now.", "error");
      },
    );

    return unsubscribe;
  }, [showNotification, userId, retryVersion]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((movie) => movie.id)),
    [favorites],
  );

  const addToFavorites = useCallback(
    async (movie) => {
      if (!userId) {
        showNotification("Sign in to save movies to your favorites.", "info");
        return false;
      }

      if (favoriteIds.has(movie.id)) {
        showNotification(
          `${movie.title} is already in your favorites.`,
          "info",
        );
        return false;
      }

      try {
        await addMovieToFavorites(db, userId, movie);
        showNotification(`${movie.title} added to your favorites.`, "success");
        return true;
      } catch (saveError) {
        console.error("[favorites] Failed to add movie", saveError);
        showNotification(
          "We couldn't add that movie to your favorites.",
          "error",
        );
        return false;
      }
    },
    [favoriteIds, showNotification, userId],
  );

  const removeFromFavorites = useCallback(
    async (movieId) => {
      if (!userId) {
        showNotification("Sign in to manage your favorites.", "info");
        return false;
      }

      const movie = favorites.find((favorite) => favorite.id === movieId);
      if (!movie) {
        return false;
      }

      try {
        await removeMovieFromFavorites(db, userId, movieId);
        showNotification(`Removed ${movie.title} from favorites.`, "info");
        return true;
      } catch (removeError) {
        console.error("[favorites] Failed to remove movie", removeError);
        showNotification("We couldn't remove that movie right now.", "error");
        return false;
      }
    },
    [favorites, showNotification, userId],
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

  const value = useMemo(
    () => ({
      favorites,
      loading,
      error,
      retry,
      toggleFavorite,
      removeFromFavorites,
      isFavorite,
    }),
    [
      error,
      favorites,
      isFavorite,
      loading,
      removeFromFavorites,
      retry,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const userId = user?.uid || null;

  return (
    <FavoritesSessionProvider
      key={userId || "guest"}
      showNotification={showNotification}
      userId={userId}
    >
      {children}
    </FavoritesSessionProvider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
