import { Link } from "react-router-dom";
import { BellIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "../../../context/LanguageContext";
import { useNotification } from "../../../context/NotificationContext";

// ─── Helpers: time label ──────────────────────────────────────────────────────

const formatTime = (isoString, language) => {
  const date = new Date(isoString);

  return date.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── NotificationPanel: navbar dropdown with recent history ───────────────────

const NotificationPanel = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const { history, unreadCount, markAllAsRead, clearHistory, getIcon } =
    useNotification();

  if (!isOpen) return null;

  return (
    <div
      id="notification-panel"
      role="region"
      aria-label={t("Notifications")}
      className="fixed left-2 right-2 top-20 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-2xl backdrop-blur-2xl duration-300 animate-in fade-in slide-in-from-top-4 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-4 sm:w-80 sm:rounded-4xl"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-6 py-5">
        <h3 className="text-sm font-black uppercase tracking-tighter italic">
          {t("Notifications")}
        </h3>

        <button
          type="button"
          onClick={clearHistory}
          aria-label={t("Clear notification history")}
          title={t("Clear notification history")}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-[var(--color-surface-1)] hover:text-red-400"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="no-scrollbar max-h-[min(25rem,calc(100dvh-12rem))] overflow-y-auto overscroll-contain">
        {history.length === 0 ? (
          <div className="p-10 text-center">
            <BellIcon className="mx-auto mb-3 h-8 w-8 text-gray-700 opacity-50" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t("No new alerts.")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {history.map((notif) => (
              <div
                key={notif.id}
                className="flex gap-4 border-b border-[var(--color-border-soft)] px-6 py-4 transition-colors hover:bg-[var(--color-surface-1)]"
              >
                {notif.movie?.poster ? (
                  <div className="relative mt-1 h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-black/20">
                    <span className="absolute inset-0 flex items-center justify-center">
                      {getIcon(notif.type, true)}
                    </span>
                    <img
                      src={notif.movie.poster}
                      alt=""
                      className="relative h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-1 shrink-0">
                    {getIcon(notif.type, true)}
                  </div>
                )}

                {notif.movie?.id != null ? (
                  <Link
                    to={`/movie/${encodeURIComponent(notif.movie.id)}`}
                    onClick={onClose}
                    className="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
                    aria-label={t("Open {title} notification", {
                      title: notif.movie.title || t("movie"),
                    })}
                  >
                    <p className="mb-1 text-[10px] font-bold leading-relaxed text-[var(--color-text)] sm:text-xs">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {formatTime(notif.timestamp, language)}
                    </span>
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-bold leading-relaxed text-[var(--color-text)] sm:text-xs">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {formatTime(notif.timestamp, language)}
                    </span>
                  </div>
                )}
                {!notif.read && (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-400"
                    aria-label={t("Unread")}
                    title={t("Unread")}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border-soft)] px-4 py-3">
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="min-h-10 rounded-xl px-3 text-xs font-bold text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("Mark all as read")}
        </button>
        <Link
          to="/notifications"
          onClick={onClose}
          className="min-h-10 rounded-xl bg-purple-600 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-purple-500"
        >
          {t("View all notifications")}
        </Link>
      </div>
    </div>
  );
};

export default NotificationPanel;
