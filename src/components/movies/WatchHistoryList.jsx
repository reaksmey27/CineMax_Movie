import { Link } from "react-router-dom";
import { CheckIcon, PlayIcon, TrashIcon } from "@heroicons/react/24/solid";
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
            className={`group min-w-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] transition-colors hover:border-purple-500/40 ${compact ? "flex flex-col" : "grid grid-cols-[5.5rem_minmax(0,1fr)] min-[480px]:flex min-[480px]:flex-col"}`}
          >
            <Link
              to={`/movie/${item.id}`}
              aria-label={item.title}
              className="block self-start w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-purple-400"
            >
              <img
                src={item.posterImage || "/images/logo.png"}
                alt=""
                loading="lazy"
                className="aspect-[4/5] max-h-72 w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3 text-sm">
              <h3 className="font-bold leading-relaxed [overflow-wrap:anywhere]">
                <Link
                  to={`/movie/${item.id}`}
                  title={item.title}
                  className="line-clamp-2 hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-purple-400"
                >
                  {item.title}
                </Link>
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--color-text-muted)]">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-semibold ${item.completed ? "border-emerald-500/30 bg-emerald-500/10 text-[var(--color-text)]" : "border-purple-500/30 bg-purple-500/10 text-[var(--color-text)]"}`}
                >
                  {item.completed && (
                    <CheckIcon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                    />
                  )}
                  {item.completed ? t("Watched") : t("Started")}
                </span>
                {!compact && (
                  <time dateTime={item.lastWatchedAt}>
                    {new Date(item.lastWatchedAt).toLocaleDateString(language, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                )}
              </div>
              {!item.completed && item.durationSeconds > 0 && (
                <div className="space-y-1">
                  <p className="text-xs tabular-nums text-[var(--color-text-muted)]">{`${formatPlaybackTime(item.positionSeconds)} / ${formatPlaybackTime(item.durationSeconds)}`}</p>
                  <progress
                    aria-label={t("Watch progress")}
                    value={
                      item.completed
                        ? item.durationSeconds
                        : item.positionSeconds
                    }
                    max={item.durationSeconds}
                    className="block h-1 w-full overflow-hidden rounded-full accent-purple-500"
                  />
                </div>
              )}
              <Link
                to={`/movie/${item.id}`}
                className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-lg bg-purple-600 px-2.5 py-2 text-center text-xs font-semibold leading-relaxed text-white [overflow-wrap:anywhere] transition-colors hover:bg-purple-500 active:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 sm:text-sm"
              >
                <PlayIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {item.completed ? t("Play Movie") : t("Continue watching")}
              </Link>
              {!compact && (
                <div className="flex items-stretch gap-2">
                  <button
                    disabled={isBusy(item.id)}
                    aria-busy={isBusy(item.id)}
                    onClick={() =>
                      item.completed ? markUnfinished(item.id) : finish(item.id)
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--color-border)] px-2 py-2 text-xs font-medium leading-relaxed text-[var(--color-text-muted)] transition-colors hover:border-purple-500/50 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-purple-400 disabled:cursor-wait disabled:opacity-50"
                  >
                    {item.completed
                      ? t("Mark as unfinished")
                      : t("Mark as watched")}
                  </button>
                  <button
                    aria-label={t("Remove")}
                    title={t("Remove")}
                    disabled={isBusy(item.id)}
                    onClick={() => remove(item.id)}
                    className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/15 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-purple-400 disabled:cursor-wait disabled:opacity-50"
                  >
                    <TrashIcon aria-hidden="true" className="h-4 w-4" />
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
