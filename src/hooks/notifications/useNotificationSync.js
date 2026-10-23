import { useCallback, useEffect, useState } from "react";

// ─── Constants: shared sync failure message ───────────────────────────────────

const SYNC_ERROR_MESSAGE =
  "Notification history could not sync. Check your connection and retry.";

// ─── useNotificationSync: Firestore subscription & remote actions ─────────────

export const useNotificationSync = ({ authResolved, userId }) => {
  const [remoteHistory, setRemoteHistory] = useState({
    userId: null,
    notifications: [],
  });
  const [syncError, setSyncError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);

  // ─── Effects: subscribe to Firestore history ─────────────────────────────────

  useEffect(() => {
    if (!authResolved) return undefined;
    if (!userId) {
      setSyncError("");
      return undefined;
    }

    let cancelled = false;
    let unsubscribe;
    setSyncError("");

    const subscribe = async () => {
      try {
        const [{ db }, notificationsModule] = await Promise.all([
          import("../../firebase/firestore"),
          import("../../firebase/notifications"),
        ]);
        if (cancelled) return;

        unsubscribe = notificationsModule.subscribeToNotifications(
          db,
          userId,
          (nextHistory) => {
            setRemoteHistory({ userId, notifications: nextHistory });
            setSyncError("");
          },
          (error) => {
            console.error("[notifications] Failed to sync history", error);
            setSyncError(SYNC_ERROR_MESSAGE);
          },
        );
      } catch (error) {
        if (cancelled) return;
        console.error("[notifications] Failed to start history sync", error);
        setSyncError(SYNC_ERROR_MESSAGE);
      }
    };

    subscribe();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [authResolved, retryVersion, userId]);

  // ─── Sync: persist actions to Firestore ──────────────────────────────────────

  const runRemoteAction = useCallback(async (user, action, description) => {
    try {
      const [{ db }, notificationsModule] = await Promise.all([
        import("../../firebase/firestore"),
        import("../../firebase/notifications"),
      ]);
      await action(db, user, notificationsModule);
      setSyncError("");
      return true;
    } catch (error) {
      console.error(`[notifications] Failed to ${description}`, error);
      setSyncError(SYNC_ERROR_MESSAGE);
      return false;
    }
  }, []);

  // ─── Sync: retry & reconnect after errors ────────────────────────────────────

  const resubscribe = useCallback(() => {
    setRetryVersion((version) => version + 1);
  }, []);

  const retrySync = useCallback(async () => {
    setSyncError("");
    setRetryVersion((version) => version + 1);
    if (!userId) return;

    try {
      const { db } = await import("../../firebase/firestore");
      const { enableNetwork } = await import("firebase/firestore");
      await enableNetwork(db);
    } catch (error) {
      console.error("[notifications] Failed to reconnect Firestore", error);
      setSyncError(SYNC_ERROR_MESSAGE);
    }
  }, [userId]);

  return { remoteHistory, syncError, runRemoteAction, resubscribe, retrySync };
};
