import { useCallback, useEffect, useState } from "react";

export default function useFavoritesSync(userId, showNotification) {
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

    let cancelled = false;
    let unsubscribe;

    const subscribe = async () => {
      try {
        const [firestore, { db }, favoritesModule] = await Promise.all([
          import("firebase/firestore"),
          import("../../firebase/firestore"),
          import("../../firebase/favorites"),
        ]);

        if (cancelled) {
          return;
        }

        const favoritesDocRef = firestore.doc(
          db,
          favoritesModule.FAVORITES_COLLECTION,
          userId,
        );
        unsubscribe = firestore.onSnapshot(
          favoritesDocRef,
          (snapshot) => {
            setFavorites(favoritesModule.getFavoriteMovies(snapshot));
            setError(false);
            setLoading(false);
          },
          (subscriptionError) => {
            console.error("[favorites] Failed to subscribe", subscriptionError);
            setError(true);
            setLoading(false);
            showNotification(
              "We couldn't sync your favorites right now.",
              "error",
            );
          },
        );
      } catch (subscriptionError) {
        if (cancelled) {
          return;
        }

        console.error(
          "[favorites] Failed to initialize subscription",
          subscriptionError,
        );
        setError(true);
        setLoading(false);
        showNotification("We couldn't sync your favorites right now.", "error");
      }
    };

    subscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [showNotification, userId, retryVersion]);

  return { favorites, loading, error, retry };
}
