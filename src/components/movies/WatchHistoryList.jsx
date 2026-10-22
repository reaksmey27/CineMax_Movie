import { Link } from "react-router-dom";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatPlaybackTime } from "../../utils/player/watchProgress";

export default function WatchHistoryList({ compact = false }) {
  const { history, finish, remove, isBusy } = useWatchHistory();
  const { t, language } = useLanguage();
  const items = compact
    ? history.filter((item) => !item.completed).slice(0, 6)
    : history;
  if (!items.length) return null;
  return (
    <section className={compact ? "mx-4 sm:mx-6 lg:mx-24" : ""}>
      {compact && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("Continue watching")}</h2>
          <Link to="/history" className="text-purple-400 underline">
            {t("History")}
          </Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]"
          >
            <Link to={`/movie/${item.id}`} className="block">
              <img
                src={item.posterImage || "/images/logo.png"}
                alt=""
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
              <h3 className="px-3 pt-3 font-bold">{item.title}</h3>
            </Link>
            <div className="space-y-3 p-3 text-sm">
              <p className="text-[var(--color-text-muted)]">
                {item.completed
                  ? t("Watched")
                  : item.durationSeconds > 0
                    ? `${formatPlaybackTime(item.positionSeconds)} / ${formatPlaybackTime(item.durationSeconds)}`
                    : t("Started")}
              </p>
              {item.durationSeconds > 0 && (
                <progress
                  aria-label={t("Watch progress")}
                  value={
                    item.completed ? item.durationSeconds : item.positionSeconds
                  }
                  max={item.durationSeconds}
                  className="h-1 w-full accent-purple-500"
                />
              )}
              {!compact && (
                <time
                  className="block text-[var(--color-text-muted)]"
                  dateTime={item.lastWatchedAt}
                >
                  {new Date(item.lastWatchedAt).toLocaleDateString(language)}
                </time>
              )}
              <Link
                to={`/movie/${item.id}`}
                className="block rounded-lg bg-purple-600 px-3 py-2 text-center font-semibold text-white"
              >
                {item.completed ? t("Play Movie") : t("Continue watching")}
              </Link>
              {!compact && (
                <div className="flex flex-col gap-2">
                  {!item.completed && (
                    <button
                      disabled={isBusy(item.id)}
                      onClick={() => finish(item.id)}
                      className="min-h-10 rounded-lg border border-[var(--color-border)] disabled:opacity-50"
                    >
                      {t("Mark as watched")}
                    </button>
                  )}
                  <button
                    disabled={isBusy(item.id)}
                    onClick={() => remove(item.id)}
                    className="min-h-10 text-red-400 disabled:opacity-50"
                  >
                    {t("Remove")}
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
