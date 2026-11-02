export const HISTORY_DATE_RANGES = ["all", "today", "week", "month"];

export function matchesHistoryDate(lastWatchedAt, range, now = new Date()) {
  if (range === "all" || !HISTORY_DATE_RANGES.includes(range)) return true;
  const watchedAt =
    typeof lastWatchedAt === "string" ? Date.parse(lastWatchedAt) : NaN;
  if (!Number.isFinite(watchedAt) || watchedAt > now.getTime()) return false;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === "week")
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  if (range === "month") start.setDate(1);
  return watchedAt >= start.getTime();
}
