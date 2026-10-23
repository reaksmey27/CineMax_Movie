import { useCallback } from "react";

export function useNotificationHistoryActions({
  userId,
  history,
  runRemoteAction,
  setLocalHistory,
}) {
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
  }, [history, runRemoteAction, setLocalHistory, userId]);

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
    [runRemoteAction, setLocalHistory, userId],
  );

  const clearHistory = useCallback(() => {
    if (userId) {
      return runRemoteAction(
        userId,
        (database, uid, notificationsModule) =>
          notificationsModule.clearNotifications(database, uid, history),
        "clear notification history",
      );
    }

    setLocalHistory([]);
    return true;
  }, [history, runRemoteAction, setLocalHistory, userId]);

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
    [runRemoteAction, setLocalHistory, userId],
  );

  return { markAllAsRead, markAsRead, clearHistory, removeFromHistory };
}
