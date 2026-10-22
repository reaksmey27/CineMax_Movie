import { Link } from "react-router-dom";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatPlaybackTime } from "../../utils/player/watchProgress";

export default function WatchHistoryList({ compact = false, movies }) {
  const { history, finish, markUnfinished, remove, isBusy } = useWatchHistory();
  const { t, language } = useLanguage();
  const items = compact
    ? history.filter((item) => !item.completed).slice(0, 6)
    : (movies ?? history);
  if (!items.length) return null;
  return (
    <section className={compact ? "mx-4 sm:mx-6 lg:mx-24" : ""}>
      {compact && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="min-w-0 text-xl font-bold sm:text-2xl">
            {t("Continue watching")}
          </h2>
          <Link
            to="/history"
            className="inline-flex min-h-11 items-center text-purple-400 underline"
          >
            {t("History")}
          </Link>
        </div>
      )}
      <div
        className={`grid gap-3 sm:gap-5 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"}`}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className={`min-w-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] ${compact ? "flex flex-col" : "grid grid-cols-[5.5rem_minmax(0,1fr)] min-[480px]:flex min-[480px]:flex-col"}`}
          >
            <Link
              to={`/movie/${item.id}`}
              aria-label={item.title}
              className="block self-start w-full focus-visible:outline-2 focus-visible:outline-purple-400"
            >
              <img
                src={item.posterImage || "/images/logo.png"}
                alt=""
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 text-sm sm:p-4">
              <h3 className="font-bold leading-relaxed [overflow-wrap:anywhere]">
                <Link
                  to={`/movie/${item.id}`}
                  className="hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-purple-400"
                >
                  {item.title}
                </Link>
              </h3>
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
                className="mt-auto flex min-h-11 items-center justify-center rounded-lg bg-purple-600 px-3 py-2 text-center font-semibold leading-relaxed text-white [overflow-wrap:anywhere] hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              >
                {item.completed ? t("Play Movie") : t("Continue watching")}
              </Link>
              {!compact && (
                <div className="flex flex-col gap-2">
                  <button
                    disabled={isBusy(item.id)}
                    aria-busy={isBusy(item.id)}
                    onClick={() =>
                      item.completed ? markUnfinished(item.id) : finish(item.id)
                    }
                    className="min-h-11 rounded-lg border border-[var(--color-border)] px-2 py-2 leading-relaxed [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-purple-400 disabled:opacity-50"
                  >
                    {item.completed
                      ? t("Mark as unfinished")
                      : t("Mark as watched")}
                  </button>
                  <button
                    disabled={isBusy(item.id)}
                    onClick={() => remove(item.id)}
                    className="min-h-11 rounded-lg px-2 py-2 text-red-400 focus-visible:outline-2 focus-visible:outline-purple-400 disabled:opacity-50"
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
