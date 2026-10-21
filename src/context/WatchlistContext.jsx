/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import useWatchlistSync from "../hooks/watchlist/useWatchlistSync";
import useWatchlistActions from "../hooks/watchlist/useWatchlistActions";

// ─── Constants: watchlist context key ─────────────────────────────────────────

const WatchlistContext = createContext();

// ─── Session Provider: live sync of watchlist ─────────────────────────────────

const WatchlistSessionProvider = ({
  children,
  onRequireSignIn,
  showNotification,
  userId,
}) => {
  const { watchlist, loading, error, retry } = useWatchlistSync(
    userId,
    showNotification,
  );
  const {
    isSavingToWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
  } = useWatchlistActions({
    watchlist,
    userId,
    onRequireSignIn,
    showNotification,
  });

  const value = useMemo(
    () => ({
      watchlist,
      isSavingToWatchlist,
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
      isSavingToWatchlist,
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

// ─── WatchlistProvider: wires auth & routing ──────────────────────────────────

export const WatchlistProvider = ({ children }) => {
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

// ─── useWatchlist: read watchlist context safely ──────────────────────────────

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
};
