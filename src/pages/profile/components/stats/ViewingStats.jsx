import { useWatchHistory } from "../../../../context/WatchHistoryContext";
import { useLanguage } from "../../../../context/LanguageContext";
import { getViewingStats } from "../../utils/viewingStats";

export default function ViewingStats() {
  const { history, loading, error, retry } = useWatchHistory();
  const { t, language } = useLanguage();
  const stats = getViewingStats(history);
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  return (
    <section
      aria-label={t("Viewing statistics")}
      className="mt-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-purple-400">
        {t("Viewing statistics")}
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {t(
          "Based on your latest 50 history entries. Missing runtimes and genres are excluded.",
        )}
      </p>
      {loading ? (
        <div
          aria-busy="true"
          aria-label={t("Loading your profile...")}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-28 animate-pulse rounded-2xl bg-[var(--color-surface-2)]"
            />
          ))}
        </div>
      ) : error ? (
        <div role="status" className="mt-5">
          <p>{t("Could not load watch history.")}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 min-h-11 rounded-xl bg-purple-600 px-5 font-semibold text-white"
          >
            {t("Try again")}
          </button>
        </div>
      ) : (
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            [t("Movies watched"), number.format(stats.watched)],
            [t("Estimated hours watched"), number.format(stats.hours)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl bg-[var(--color-surface-1)] p-4"
            >
              <dt className="text-sm text-[var(--color-text-muted)]">
                {label}
              </dt>
              <dd className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                {value}
              </dd>
            </div>
          ))}
          <div className="min-w-0 rounded-2xl bg-[var(--color-surface-1)] p-4">
            <dt className="text-sm text-[var(--color-text-muted)]">
              {t("Most-watched genres")}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {stats.genres.length ? (
                stats.genres.map(([genre, count]) => (
                  <span
                    key={genre}
                    className="rounded-lg bg-purple-500/10 px-2 py-1 text-sm text-[var(--color-text)]"
                  >
                    {t(genre)} · {number.format(count)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--color-text-muted)]">
                  {t("No genre data yet")}
                </span>
              )}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
