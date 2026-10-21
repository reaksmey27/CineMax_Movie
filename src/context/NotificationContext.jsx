import { useNotificationHistoryActions } from "../hooks/notifications/useNotificationHistoryActions";
import { useNotificationImport } from "../hooks/notifications/useNotificationImport";
import { useNotificationToasts } from "../hooks/notifications/useNotificationToasts";
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  readStoredNotifications,
  writeStoredNotifications,
} from "./notifications/notificationStorage";
import { getNotificationIcon } from "./notifications/notificationPresentation";
import NotificationToasts from "./notifications/NotificationToasts";
import { useNotificationSync } from "../hooks/notifications/useNotificationSync";

// ─── Constants: notification context key ──────────────────────────────────────

const NotificationContext = createContext();

// ─── NotificationProvider: toasts & history state ─────────────────────────────

export const NotificationProvider = ({ children }) => {
  const [localHistory, setLocalHistory] = useState(() =>
    readStoredNotifications(),
  );
  const [userId, setUserId] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const { remoteHistory, syncError, runRemoteAction, resubscribe, retrySync } =
    useNotificationSync({ authResolved, userId });

  // ─── State Selectors: merged local/remote history ────────────────────────────

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

  // ─── Effects: auth & connectivity ────────────────────────────────────────────

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
      resubscribe();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [resubscribe]);

  useEffect(() => {
    if (!authResolved || userId) return;
    writeStoredNotifications(localHistory);
  }, [authResolved, localHistory, userId]);

  // ─── Selectors: unread badge count ───────────────────────────────────────────

  const unreadCount = useMemo(
    () => history.filter((notification) => !notification.read).length,
    [history],
  );

  // ─── Actions: toast, read & clear history ────────────────────────────────────

  const { notifications, showNotification, removeNotification } =
    useNotificationToasts(runRemoteAction, setLocalHistory);

  const { markAllAsRead, markAsRead, clearHistory, removeFromHistory } =
    useNotificationHistoryActions({
      userId,
      history,
      runRemoteAction,
      setLocalHistory,
    });

  const {
    shouldOfferLocalImport,
    isImportingHistory,
    importMessage,
    importError,
    importLocalHistory,
    keepLocalHistory,
  } = useNotificationImport({
    userId,
    remoteHistory,
    localHistory,
    setLocalHistory,
  });

  // ─── Context Value: memoized notification API ────────────────────────────────

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
      getIcon: getNotificationIcon,
    }),
    [
      clearHistory,
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
      <NotificationToasts
        notifications={notifications}
        onDismiss={removeNotification}
      />
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
