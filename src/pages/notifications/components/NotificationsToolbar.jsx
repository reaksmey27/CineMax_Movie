import { CheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import { useNotification } from "../../../context/NotificationContext";
import { FILTERS } from "./notificationHelpers";

// ─── NotificationsToolbar: filter switch & bulk actions ───────────────────────

const NotificationsToolbar = ({
  filter,
  onFilterChange,
  unreadCount,
  hasHistory,
  confirmClear,
  onSetConfirmClear,
  onClearHistory,
}) => {
  const { t } = useLanguage();
  const { markAllAsRead } = useNotification();

  return (
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
            onClick={() => onFilterChange(filterOption)}
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
              onClick={onClearHistory}
              className="min-h-10 rounded-xl bg-red-500/15 px-3 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/25"
            >
              {t("Confirm")}
            </button>
            <button
              type="button"
              onClick={() => onSetConfirmClear(false)}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-(--color-text-subtle) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text)"
              aria-label={t("Cancel clearing notifications")}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSetConfirmClear(true)}
            disabled={!hasHistory}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-(--color-text-subtle) transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
            {t("Clear history")}
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationsToolbar;
