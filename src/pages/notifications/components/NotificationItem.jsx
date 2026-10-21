import { Link } from "react-router-dom";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import { useNotification } from "../../../context/NotificationContext";
import { formatRelativeTime, getTypeLabel } from "./notificationHelpers";

// ─── NotificationItem: single history row ─────────────────────────────────────

const NotificationItem = ({ notification }) => {
  const { language, t } = useLanguage();
  const { getIcon, markAsRead, removeFromHistory } = useNotification();

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
};

export default NotificationItem;
