// ─── Constants: history filters ───────────────────────────────────────────────

export const FILTERS = ["all", "unread"];

// ─── Helpers: relative time & type labels ─────────────────────────────────────

export const formatRelativeTime = (timestamp, language) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  if (Math.abs(seconds) < 60) return "Just now";

  const formatter = new Intl.RelativeTimeFormat(language, {
    numeric: "auto",
    style: "short",
  });
  const units = [
    ["minute", 60],
    ["hour", 60 * 60],
    ["day", 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["year", 365 * 24 * 60 * 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) < size * (unit === "minute" ? 60 : 2)) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }

  return formatter.format(Math.round(seconds / (365 * 24 * 60 * 60)), "year");
};

export const getTypeLabel = (type, t) => {
  switch (type) {
    case "success":
      return t("Success");
    case "error":
      return t("Error");
    case "warning":
      return t("Warning");
    default:
      return t("Update");
  }
};
