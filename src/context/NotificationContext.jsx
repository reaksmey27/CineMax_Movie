/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { auth } from "../firebase/config";
import { useLanguage } from "./LanguageContext";

// ─── Constants: notification context key ──────────────────────────────────────

const NotificationContext = createContext();

// ─── Helpers: persist history in localStorage ─────────────────────────────────

const readStoredNotifications = () => {
  try {
    const saved = localStorage.getItem("cinema_notifications");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredNotifications = (notifications) => {
  try {
    localStorage.setItem("cinema_notifications", JSON.stringify(notifications));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

// ─── NotificationProvider: toasts & history state ─────────────────────────────

export const NotificationProvider = ({ children }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [localHistory, setLocalHistory] = useState(() =>
    readStoredNotifications(),
  );
  const [remoteHistory, setRemoteHistory] = useState({
    userId: null,
    notifications: [],
  });
  const [userId, setUserId] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [syncError, setSyncError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const [importDismissedFor, setImportDismissedFor] = useState(null);
  const [isImportingHistory, setIsImportingHistory] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  // ─── State Selectors: merged local/remote history ─────────────────────────────

  const history = useMemo(
    () =>
      !authResolved
        ? []
        : userId && remoteHistory.userId === userId
          ? remoteHistory.notifications
          : userId
            ? []
            : localHistory,
    [authResolved, localHistory, remoteHistory, userId],
  );

  // ─── Effects: auth, connectivity & Firestore sync ─────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUserId(currentUser?.uid || null);
      setAuthResolved(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryVersion((version) => version + 1);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!authResolved || userId) return;
    writeStoredNotifications(localHistory);
  }, [authResolved, localHistory, userId]);

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
          import("../firebase/firestore"),
          import("../firebase/notifications"),
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
            setSyncError(
              "Notification history could not sync. Check your connection and retry.",
            );
          },
        );
      } catch (error) {
        if (cancelled) return;
        console.error("[notifications] Failed to start history sync", error);
        setSyncError(
          "Notification history could not sync. Check your connection and retry.",
        );
      }
    };

    subscribe();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [authResolved, retryVersion, userId]);

  // ─── Sync: persist actions to Firestore ───────────────────────────────────────

  const runRemoteAction = useCallback(async (user, action, description) => {
    try {
      const [{ db }, notificationsModule] = await Promise.all([
        import("../firebase/firestore"),
        import("../firebase/notifications"),
      ]);
      await action(db, user, notificationsModule);
      setSyncError("");
    } catch (error) {
      console.error(`[notifications] Failed to ${description}`, error);
      setSyncError(
        "Notification history could not sync. Check your connection and retry.",
      );
    }
  }, []);

  // ─── Selectors: unread badge count ────────────────────────────────────────────

  const unreadCount = useMemo(
    () => history.filter((notification) => !notification.read).length,
    [history],
  );

  // ─── Actions: toast, read & clear history ─────────────────────────────────────

  const showNotification = useCallback(
    (message, type = "success", movie) => {
      const id = crypto.randomUUID();
      const notificationMovie =
        movie?.id != null
          ? {
              id: movie.id,
              title: movie.title || "Movie",
              poster: movie.posterImage || movie.image || null,
            }
          : undefined;
      const newNotification = {
        id,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        ...(notificationMovie ? { movie: notificationMovie } : {}),
      };

      setNotifications((prev) => [
        ...prev,
        { ...newNotification, visible: false },
      ]);
      const currentUserId = auth.currentUser?.uid;
      if (currentUserId) {
        void runRemoteAction(
          currentUserId,
          (database, uid, notificationsModule) =>
            notificationsModule.saveNotification(
              database,
              uid,
              newNotification,
            ),
          "save notification",
        );
      } else {
        setLocalHistory((prev) => [newNotification, ...prev].slice(0, 50));
      }

      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, visible: true }
              : notification,
          ),
        );
      }, 10);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, visible: false }
              : notification,
          ),
        );
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id),
          );
        }, 500);
      }, 5000);
    },
    [runRemoteAction],
  );

  const markAllAsRead = useCallback(() => {
    if (userId) {
      void runRemoteAction(
        userId,
        (database, uid, notificationsModule) =>
          notificationsModule.markAllNotificationsAsRead(
            database,
            uid,
            history,
          ),
        "mark notifications as read",
      );
      return;
    }

    setLocalHistory((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  }, [history, runRemoteAction, userId]);

  const markAsRead = useCallback(
    (id) => {
      if (userId) {
        void runRemoteAction(
          userId,
          (database, uid, notificationsModule) =>
            notificationsModule.markNotificationAsRead(database, uid, id),
          "mark notification as read",
        );
        return;
      }

      setLocalHistory((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    [runRemoteAction, userId],
  );

  const clearHistory = useCallback(() => {
    if (userId) {
      void runRemoteAction(
        userId,
        (database, uid, notificationsModule) =>
          notificationsModule.clearNotifications(database, uid, history),
        "clear notification history",
      );
      return;
    }

    setLocalHistory([]);
  }, [history, runRemoteAction, userId]);

  const removeFromHistory = useCallback(
    (id) => {
      if (userId) {
        void runRemoteAction(
          userId,
          (database, uid, notificationsModule) =>
            notificationsModule.removeNotification(database, uid, id),
          "remove notification",
        );
        return;
      }

      setLocalHistory((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    },
    [runRemoteAction, userId],
  );

  // ─── Sync: retry & import history ─────────────────────────────────────────────

  const retrySync = useCallback(async () => {
    setSyncError("");
    setRetryVersion((version) => version + 1);
    if (!userId) return;

    try {
      const { db } = await import("../firebase/firestore");
      const { enableNetwork } = await import("firebase/firestore");
      await enableNetwork(db);
    } catch (error) {
      console.error("[notifications] Failed to reconnect Firestore", error);
      setSyncError(
        "Notification history could not sync. Check your connection and retry.",
      );
    }
  }, [userId]);

  const shouldOfferLocalImport = Boolean(
    userId &&
    remoteHistory.userId === userId &&
    localHistory.length > 0 &&
    importDismissedFor !== userId,
  );

  const importLocalHistory = useCallback(async () => {
    if (!userId || !shouldOfferLocalImport || isImportingHistory) return;

    setIsImportingHistory(true);
    setImportError("");
    setImportMessage("");

    try {
      const [{ db }, notificationsModule] = await Promise.all([
        import("../firebase/firestore"),
        import("../firebase/notifications"),
      ]);
      const result = await notificationsModule.importNotifications(
        db,
        userId,
        localHistory,
      );
      const consumedIds = new Set(result.consumedIds);

      setLocalHistory((previous) =>
        previous.filter((notification) => !consumedIds.has(notification.id)),
      );
      writeStoredNotifications(
        localHistory.filter(
          (notification) => !consumedIds.has(notification.id),
        ),
      );
      setImportDismissedFor(userId);
      setImportMessage(
        t(
          "Imported {count} notification(s). Your account keeps the 50 most recent.",
          {
            count: result.importedCount,
          },
        ),
      );
      if (result.skippedCount > 0) {
        setImportError(
          t("{count} invalid local notification(s) were left on this device.", {
            count: result.skippedCount,
          }),
        );
      }
    } catch (error) {
      console.error("[notifications] Failed to import local history", error);
      setImportError(
        t(
          "Local notification history could not be imported. It remains on this device; check your connection and retry.",
        ),
      );
    } finally {
      setIsImportingHistory(false);
    }
  }, [isImportingHistory, localHistory, shouldOfferLocalImport, t, userId]);

  const keepLocalHistory = useCallback(() => {
    setImportDismissedFor(userId);
    setImportError("");
    setImportMessage(t("Your older notifications will remain on this device."));
  }, [t, userId]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, visible: false }
          : notification,
      ),
    );
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    }, 500);
  }, []);

  // ─── Helpers: icon & style lookup ─────────────────────────────────────────────

  const getIcon = useCallback((type, small = false) => {
    const size = small ? "h-5 w-5" : "h-6 w-6";
    switch (type) {
      case "success":
        return <CheckCircleIcon className={`${size} text-emerald-400`} />;
      case "error":
        return <XCircleIcon className={`${size} text-red-400`} />;
      case "warning":
        return <ExclamationTriangleIcon className={`${size} text-amber-400`} />;
      default:
        return <InformationCircleIcon className={`${size} text-blue-400`} />;
    }
  }, []);

  const getStyles = useCallback((type) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10";
      case "error":
        return "bg-red-500/10 border-red-500/20 shadow-red-500/10";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 shadow-amber-500/10";
      default:
        return "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10";
    }
  }, []);

  // ─── Context Value: memoized notification API ─────────────────────────────────

  const historyLoading =
    !authResolved ||
    (Boolean(userId) && remoteHistory.userId !== userId && !syncError);

  const value = useMemo(
    () => ({
      showNotification,
      history,
      historyLoading,
      localHistoryCount: localHistory.length,
      unreadCount,
      syncError,
      isOnline,
      isAuthenticated: Boolean(userId),
      retrySync,
      shouldOfferLocalImport,
      isImportingHistory,
      importMessage,
      importError,
      importLocalHistory,
      keepLocalHistory,
      markAsRead,
      markAllAsRead,
      clearHistory,
      removeFromHistory,
      getIcon,
    }),
    [
      clearHistory,
      getIcon,
      history,
      historyLoading,
      localHistory.length,
      markAsRead,
      markAllAsRead,
      removeFromHistory,
      showNotification,
      unreadCount,
      syncError,
      isOnline,
      retrySync,
      shouldOfferLocalImport,
      isImportingHistory,
      importMessage,
      importError,
      importLocalHistory,
      keepLocalHistory,
      userId,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[2000] flex flex-col gap-3 sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-sm sm:gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-2xl transition-all duration-500 transform sm:min-w-[320px] sm:gap-4 sm:px-6 sm:py-4 ${
              notification.visible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            } ${getStyles(notification.type)}`}
          >
            {notification.movie?.poster ? (
              <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
                <span className="absolute inset-0 flex items-center justify-center">
                  {getIcon(notification.type, true)}
                </span>
                <img
                  src={notification.movie.poster}
                  alt=""
                  className="relative h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              </div>
            ) : (
              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            )}
            <p className="flex-1 text-sm font-bold text-white tracking-wide">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-white transition-colors p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// ─── useNotification: read notification context safely ────────────────────────

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
