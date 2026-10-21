/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import useFavoritesSync from "../hooks/favorites/useFavoritesSync";
import useFavoritesActions from "../hooks/favorites/useFavoritesActions";

// ─── Constants: favorites context key ─────────────────────────────────────────

const FavoritesContext = createContext();

// ─── Session Provider: live sync of favorites ─────────────────────────────────

const FavoritesSessionProvider = ({
  children,
  onRequireSignIn,
  showNotification,
  userId,
}) => {
  const { favorites, loading, error, retry } = useFavoritesSync(
    userId,
    showNotification,
  );
  const { isSavingFavorite, removeFromFavorites, isFavorite, toggleFavorite } =
    useFavoritesActions({
      favorites,
      userId,
      onRequireSignIn,
      showNotification,
    });

  const value = useMemo(
    () => ({
      favorites,
      loading,
      error,
      isSavingFavorite,
      retry,
      toggleFavorite,
      removeFromFavorites,
      isFavorite,
    }),
    [
      error,
      favorites,
      isFavorite,
      isSavingFavorite,
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

// ─── FavoritesProvider: wires auth & routing ──────────────────────────────────

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = user?.uid || null;
  const onRequireSignIn = useCallback(
    (message, movie) => {
      showNotification(message, "info", movie);
      navigate("/login", {
        state: { backgroundLocation: location },
      });
    },
    [location, navigate, showNotification],
  );

  return (
    <FavoritesSessionProvider
      key={userId || "guest"}
      onRequireSignIn={onRequireSignIn}
      showNotification={showNotification}
      userId={userId}
    >
      {children}
    </FavoritesSessionProvider>
  );
};

// ─── useFavorites: read favorites context safely ──────────────────────────────

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
