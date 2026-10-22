import { useState } from "react";
import MovieCard from "../../components/ui/MovieCard";
import { useLanguage } from "../../context/LanguageContext";
import CollectionFilters from "../../components/movies/CollectionFilters";
import { getWatchlistView } from "./watchlistView";

export default function WatchlistLibrary({
  header,
  movies,
  setWatched,
  isSaving,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("saved");
  const visible = getWatchlistView(movies, query, status, sort);
  const watchedCount = movies.filter((movie) => movie.watched === true).length;
  return (
    <section aria-label={t("Saved movies")}>
      <CollectionFilters
        header={header}
        searchLabel={t("Search watchlist")}
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
        total={movies.length}
        watchedCount={watchedCount}
        count={visible.length}
        reset={() => {
          setQuery("");
          setStatus("all");
          setSort("saved");
        }}
      />
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
        </div>
      )}
    </section>
  );
}
