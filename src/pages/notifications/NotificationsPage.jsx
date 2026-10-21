import { useMemo, useState } from "react";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { useNotification } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import ListSkeleton from "../../components/ui/ListSkeleton";
import NotificationsToolbar from "./components/NotificationsToolbar";
import NotificationStatusNotices from "./components/NotificationStatusNotices";
import NotificationsEmptyState from "./components/NotificationsEmptyState";
import NotificationItem from "./components/NotificationItem";

// ─── NotificationsPage: history & unread list ─────────────────────────────────

const NotificationsPage = () => {
  const { t } = useLanguage();
  const {
    history,
    historyLoading,
    localHistoryCount,
    unreadCount,
    clearHistory,
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

  // ─── Selectors: filtered history ─────────────────────────────────────────────

  const filteredHistory = useMemo(
    () =>
      filter === "unread"
        ? history.filter((notification) => !notification.read)
        : history,
    [filter, history],
  );

  // ─── Handlers: clear with confirmation ───────────────────────────────────────

  const handleClearHistory = () => {
    clearHistory();
    setConfirmClear(false);
  };

  // ─── Render: header, filters & list ──────────────────────────────────────────

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

        <NotificationStatusNotices
          isOnline={isOnline}
          isAuthenticated={isAuthenticated}
          shouldOfferLocalImport={shouldOfferLocalImport}
          localHistoryCount={localHistoryCount}
          isImportingHistory={isImportingHistory}
          importMessage={importMessage}
          importError={importError}
          syncError={syncError}
          onImportLocalHistory={importLocalHistory}
          onKeepLocalHistory={keepLocalHistory}
          onRetrySync={retrySync}
        />

        <NotificationsToolbar
          filter={filter}
          onFilterChange={setFilter}
          unreadCount={unreadCount}
          hasHistory={history.length > 0}
          confirmClear={confirmClear}
          onSetConfirmClear={setConfirmClear}
          onClearHistory={handleClearHistory}
        />

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
            <NotificationsEmptyState filter={filter} />
          ) : (
            <ul className="divide-y divide-(--color-border-soft)">
              {filteredHistory.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
