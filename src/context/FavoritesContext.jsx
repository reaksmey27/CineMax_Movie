/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNotification } from "./NotificationContext";

const FavoritesContext = createContext();

const readStoredFavorites = () => {
  try {
    const saved = localStorage.getItem("movie_favorites");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredFavorites = (favorites) => {
  try {
    localStorage.setItem("movie_favorites", JSON.stringify(favorites));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

export const FavoritesProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const [favorites, setFavorites] = useState(() => readStoredFavorites());

  useEffect(() => {
    writeStoredFavorites(favorites);
  }, [favorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((movie) => movie.id)),
    [favorites],
  );

  const addToFavorites = useCallback(
    (movie) => {
      if (favoriteIds.has(movie.id)) {
        return;
      }

      setFavorites((prev) => [...prev, movie]);
      showNotification(`${movie.title} added to your collection!`, "success");
    },
    [favoriteIds, showNotification],
  );

  const removeFromFavorites = useCallback(
    (movieId) => {
      const movie = favorites.find((favorite) => favorite.id === movieId);
      if (!movie) {
        return;
      }

      setFavorites((prev) =>
        prev.filter((favorite) => favorite.id !== movieId),
      );
      showNotification(`Removed ${movie.title} from favorites.`, "info");
    },
    [favorites, showNotification],
  );

  const isFavorite = useCallback(
    (movieId) => favoriteIds.has(movieId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (movie) => {
      if (favoriteIds.has(movie.id)) {
        removeFromFavorites(movie.id);
        return;
      }

      addToFavorites(movie);
    },
    [addToFavorites, favoriteIds, removeFromFavorites],
  );

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      removeFromFavorites,
      isFavorite,
    }),
    [favorites, isFavorite, toggleFavorite, removeFromFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
