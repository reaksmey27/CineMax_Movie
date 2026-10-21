import { useCallback, useState } from "react";
import { auth } from "../../firebase/config";
import { useToastTimers } from "./useToastTimers";

export function useNotificationToasts(runRemoteAction, setLocalHistory) {
  const scheduleToast = useToastTimers();
  const [notifications, setNotifications] = useState([]);
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

      scheduleToast(() => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, visible: true }
              : notification,
          ),
        );
      }, 10);

      scheduleToast(() => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, visible: false }
              : notification,
          ),
        );
        scheduleToast(() => {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id),
          );
        }, 500);
      }, 5000);
    },
    [runRemoteAction, scheduleToast, setLocalHistory],
  );

  const removeNotification = useCallback(
    (id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, visible: false }
            : notification,
        ),
      );
      scheduleToast(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id),
        );
      }, 500);
    },
    [scheduleToast],
  );

  // ─── Sync: import local history ──────────────────────────────────────────────

  return { notifications, showNotification, removeNotification };
}
