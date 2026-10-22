import { useState } from "react";
import MovieCard from "../../components/ui/MovieCard";
import { useLanguage } from "../../context/LanguageContext";
import { getWatchlistView } from "./watchlistView";

const CONTROL =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-[var(--color-text)]";

export default function WatchlistLibrary({ movies, setWatched, isSaving }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("saved");
  const visible = getWatchlistView(movies, query, status, sort);
  const watchedCount = movies.filter((movie) => movie.watched === true).length;
  return (
    <section aria-label={t("Saved movies")}>
      <div className="mb-6 grid gap-4 text-sm font-semibold text-[var(--color-text)] sm:grid-cols-3">
        <label>
          {t("Search watchlist")}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={CONTROL}
          />
        </label>
        <label>
          {t("Watch status")}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={CONTROL}
          >
            <option value="all">
              {t("All")} ({movies.length})
            </option>
            <option value="unwatched">
              {t("To watch")} ({movies.length - watchedCount})
            </option>
            <option value="watched">
              {t("Watched")} ({watchedCount})
            </option>
          </select>
        </label>
        <label>
          {t("Sort By")}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className={CONTROL}
          >
            <option value="saved">{t("Recently saved")}</option>
            <option value="title">{t("Title A-Z")}</option>
            <option value="rating">{t("Highest Rated")}</option>
          </select>
        </label>
      </div>
      <p role="status" className="mb-6 text-sm text-[var(--color-text-muted)]">
        {t("Showing {count} of {total} movies", {
          count: visible.length,
          total: movies.length,
        })}
      </p>
      {visible.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((movie) => (
            <div key={movie.id} className="min-w-0">
              <MovieCard movie={movie} />
              <button
                type="button"
                disabled={isSaving(movie.id)}
                aria-busy={isSaving(movie.id)}
                aria-pressed={movie.watched === true}
                aria-label={t("Watched: {title}", { title: movie.title })}
                onClick={() => setWatched(movie, movie.watched !== true)}
                className={`mt-3 min-h-11 w-full rounded-xl border px-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-60 ${movie.watched ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] text-[var(--color-text)]"}`}
              >
                {isSaving(movie.id)
                  ? t("Saving...")
                  : movie.watched
                    ? t("Watched")
                    : t("Mark as watched")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-[var(--color-text-muted)]">
          <p>{t("No saved movies match your search or status.")}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
            className="mt-4 min-h-11 rounded-xl bg-purple-600 px-4 font-semibold text-white"
          >
            {t("Reset filters")}
          </button>
        </div>
      )}
    </section>
  );
}
