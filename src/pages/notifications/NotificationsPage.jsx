import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellAlertIcon,
  BellIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import ListSkeleton from "../../components/ui/ListSkeleton";

// ─── Constants: history filters ───────────────────────────────────────────────

const FILTERS = ["all", "unread"];

// ─── Helpers: relative time & type labels ─────────────────────────────────────

const formatRelativeTime = (timestamp, language) => {
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

const getTypeLabel = (type, t) => {
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

// ─── NotificationsPage: history & unread list ─────────────────────────────────

const NotificationsPage = () => {
  const { language, t } = useLanguage();
  const {
    history,
    historyLoading,
    localHistoryCount,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearHistory,
    removeFromHistory,
    getIcon,
    syncError,
    isOnline,
    isAuthenticated,
    retrySync,
    shouldOfferLocalImport,
    isImportingHistory,
    importMessage,
    importError,
    importLocalHistory,
    keepLocalHistory,
  } = useNotification();
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  // ─── Selectors: filtered history ──────────────────────────────────────────────

  const filteredHistory = useMemo(
    () =>
      filter === "unread"
        ? history.filter((notification) => !notification.read)
        : history,
    [filter, history],
  );

  // ─── Handlers: clear with confirmation ────────────────────────────────────────

  const handleClearHistory = () => {
    clearHistory();
    setConfirmClear(false);
  };

  // ─── Render: header, filters & list ───────────────────────────────────────────

  return (
    <section className="relative min-h-screen overflow-hidden bg-(--color-bg) px-4 pb-16 pt-24 text-(--color-text) sm:px-6 sm:pb-24 sm:pt-32 lg:px-12">
      <div className="pointer-events-none absolute -right-40 top-10 -z-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-10 -z-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
              <BellAlertIcon className="h-4 w-4" aria-hidden="true" />
              {t("Your activity")}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              {t("Notifications")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-text-subtle) sm:text-base">
              {t("Keep up with updates from your CineMax movie experience.")}
            </p>
          </div>

          <div
            className="flex items-center gap-3"
            aria-label={t("{count} unread notifications", {
              count: unreadCount,
            })}
          >
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-1) px-4 py-3">
              <span className="block text-2xl font-black leading-none">
                {unreadCount}
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-(--color-text-subtle)">
                {t("Unread")}
              </span>
            </div>
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-1) px-4 py-3">
              <span className="block text-2xl font-black leading-none">
                {history.length}
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-(--color-text-subtle)">
                {t("Total")}
              </span>
            </div>
          </div>
        </header>

        {isAuthenticated && !isOnline && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            {t(
              "You’re offline. Firestore will queue notification changes and sync them when you reconnect.",
            )}
          </div>
        )}

        {shouldOfferLocalImport && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-purple-100">
                {t("Import browser notification history?")}
              </h2>
              <p className="mt-1 text-sm text-purple-100/75">
                {t(
                  "{count} notification(s) are stored on this device. Import them into your account? Only the 50 newest will be kept.",
                  { count: localHistoryCount },
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={importLocalHistory}
                disabled={!isOnline || isImportingHistory}
                className="min-h-10 rounded-xl bg-purple-600 px-4 text-sm font-bold text-white transition-colors hover:bg-purple-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isImportingHistory ? t("Importing...") : t("Import history")}
              </button>
              <button
                type="button"
                onClick={keepLocalHistory}
                disabled={isImportingHistory}
                className="min-h-10 rounded-xl border border-purple-200/20 px-4 text-sm font-bold text-purple-100 transition-colors hover:bg-purple-200/10 disabled:opacity-60"
              >
                {t("Keep on this device")}
              </button>
            </div>
          </div>
        )}

        {importMessage && (
          <p
            role="status"
            className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100"
          >
            {importMessage}
          </p>
        )}

        {importError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100"
          >
            {importError}
          </p>
        )}

        {syncError && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{t(syncError)}</p>
            <button
              type="button"
              onClick={retrySync}
              className="min-h-10 shrink-0 rounded-xl bg-red-500/15 px-4 font-bold text-red-100 transition-colors hover:bg-red-500/25"
            >
              {t("Retry sync")}
            </button>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface-1) p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div
            className="flex w-fit rounded-xl bg-(--color-surface-2) p-1"
            role="group"
            aria-label={t("Filter notifications")}
          >
            {FILTERS.map((filterOption) => (
              <button
                key={filterOption}
                type="button"
                aria-pressed={filter === filterOption}
                onClick={() => setFilter(filterOption)}
                className={`min-h-10 rounded-lg px-4 text-xs font-bold capitalize transition-colors ${
                  filter === filterOption
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-950/20"
                    : "text-(--color-text-subtle) hover:text-(--color-text)"
                }`}
              >
                {filterOption === "all" ? t("All") : t("Unread")}
                {filterOption === "unread" && ` (${unreadCount})`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-(--color-text-soft) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              {t("Mark all read")}
            </button>
            {confirmClear ? (
              <>
                <span className="px-1 text-xs text-(--color-text-subtle)">
                  {t("Clear all notifications?")}
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="min-h-10 rounded-xl bg-red-500/15 px-3 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/25"
                >
                  {t("Confirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-(--color-text-subtle) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text)"
                  aria-label={t("Cancel clearing notifications")}
                >
                  <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={history.length === 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-(--color-text-subtle) transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                {t("Clear history")}
              </button>
            )}
          </div>
        </div>

        <div
          className="overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-panel-bg) shadow-2xl"
          aria-live="polite"
        >
          {historyLoading ? (
            <div role="status" className="p-4 sm:p-6">
              <span className="sr-only">{t("Loading notifications...")}</span>
              <ListSkeleton count={4} />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center sm:min-h-96">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface-1)">
                <BellIcon
                  className="h-8 w-8 text-(--color-text-subtle)"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-xl font-black">
                {filter === "unread"
                  ? t("You’re all caught up")
                  : t("No notifications yet")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-(--color-text-subtle)">
                {filter === "unread"
                  ? t(
                      "There are no unread updates. New activity will show up here.",
                    )
                  : t(
                      "Updates about your saved movies and account activity will appear here.",
                    )}
              </p>
              {filter === "all" && (
                <Link
                  to="/movies"
                  className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-purple-600 px-5 text-sm font-bold text-white transition-colors hover:bg-purple-500"
                >
                  {t("Explore movies")}
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-(--color-border-soft)">
              {filteredHistory.map((notification) => {
                const details = (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-(--color-text-subtle)">
                        {getTypeLabel(notification.type, t)}
                      </span>
                      {!notification.read && (
                        <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          {t("New")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 break-words text-sm font-semibold leading-6 text-(--color-text) sm:text-base">
                      {notification.message}
                    </p>
                    <time
                      className="mt-1 block text-xs text-(--color-text-subtle)"
                      dateTime={notification.timestamp}
                      title={new Date(notification.timestamp).toLocaleString()}
                    >
                      {formatRelativeTime(notification.timestamp, language)}
                    </time>
                  </>
                );
                const moviePath =
                  notification.movie?.id != null
                    ? `/movie/${encodeURIComponent(notification.movie.id)}`
                    : null;

                return (
                  <li
                    key={notification.id}
                    className={`flex gap-3 px-4 py-5 transition-colors hover:bg-(--color-surface-1) sm:gap-4 sm:px-6 ${
                      !notification.read ? "bg-purple-500/[0.04]" : ""
                    }`}
                  >
                    {notification.movie?.poster ? (
                      <Link
                        to={moviePath}
                        aria-label={t("View {title}", {
                          title: notification.movie.title,
                        })}
                        className="group relative h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-(--color-border-soft) bg-(--color-surface-1) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 sm:h-24 sm:w-16"
                      >
                        <span className="absolute inset-0 flex items-center justify-center">
                          {getIcon(notification.type, true)}
                        </span>
                        <img
                          src={notification.movie.poster}
                          alt=""
                          className="relative h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.hidden = true;
                          }}
                        />
                      </Link>
                    ) : (
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--color-border-soft) bg-(--color-surface-1)">
                        {getIcon(notification.type, true)}
                      </div>
                    )}

                    {moviePath ? (
                      <Link
                        to={moviePath}
                        className="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
                        aria-label={t("Open {title} notification", {
                          title: notification.movie.title || t("movie"),
                        })}
                      >
                        {details}
                      </Link>
                    ) : (
                      <div className="min-w-0 flex-1">{details}</div>
                    )}

                    <div className="flex shrink-0 items-start gap-1">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-(--color-text-subtle) transition-colors hover:bg-purple-500/10 hover:text-purple-300"
                          aria-label={t("Mark notification as read")}
                          title={t("Mark as read")}
                        >
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromHistory(notification.id)}
                        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-(--color-text-subtle) transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={t("Remove notification")}
                        title={t("Remove notification")}
                      >
                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
