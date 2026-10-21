const NOTIFICATION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const normalizeLocalNotification = (notification) => {
  const isValid =
    typeof notification?.id === "string" &&
    NOTIFICATION_ID_PATTERN.test(notification.id) &&
    typeof notification.message === "string" &&
    typeof notification.type === "string" &&
    typeof notification.timestamp === "string" &&
    Number.isFinite(Date.parse(notification.timestamp)) &&
    typeof notification.read === "boolean";

  if (!isValid) return null;

  const normalized = {
    message: notification.message,
    type: notification.type,
    timestamp: new Date(notification.timestamp).toISOString(),
    read: notification.read,
  };
  if (notification.movie && typeof notification.movie === "object") {
    const { id, title, poster } = notification.movie;
    normalized.movie = {
      ...(typeof id === "string" ||
      (typeof id === "number" && Number.isFinite(id))
        ? { id }
        : {}),
      ...(typeof title === "string" ? { title } : {}),
      ...(typeof poster === "string" ? { poster } : {}),
    };
  }

  return normalized;
};
