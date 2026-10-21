import { useCallback, useEffect, useState } from "react";

export default function useWatchlistSync(userId, showNotification) {
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
          import("../../firebase/firestore"),
          import("../../firebase/watchlist"),
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

  return { watchlist, loading, error, retry };
}
