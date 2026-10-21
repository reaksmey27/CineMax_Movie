// ─── Helpers: persist notification history in localStorage ────────────────────

export const readStoredNotifications = () => {
  try {
    const saved = localStorage.getItem("cinema_notifications");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeStoredNotifications = (notifications) => {
  try {
    localStorage.setItem("cinema_notifications", JSON.stringify(notifications));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};
