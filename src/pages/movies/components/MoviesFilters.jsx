import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORT_OPTIONS,
  MIN_RATING_OPTIONS,
} from "../../../config/movieFilters";
import { useLanguage } from "../../../context/LanguageContext";
import FilterSelect from "./FilterSelect";
import { GENRE_BTN_BASE, INPUT_CLASS, LABEL_CLASS } from "./filterStyles";

// ─── MoviesFilters: genre/year/rating/sort bar ────────────────────────────────

const MoviesFilters = ({
  genres,
  genresLoading,
  genresError,
  hasActiveFilters,
  hasSearchQuery,
  minRating,
  onClearFilters,
  onGenreChange,
  onRatingChange,
  onRetryGenres,
  onSortChange,
  openSelect,
  selectedGenre,
  sortBy,
  toggleSelect,
  yearInput,
  setYearInput,
}) => {
  const { t } = useLanguage();
  // ─── Render: filter toolbar ──────────────────────────────────────────────────

  return (
    <div className="relative z-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-400">
            {t("Discover filters")}
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-gray-400">
            {t("Find movies by genre, release year, rating, and sort order.")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="min-h-11 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-purple-500/40 hover:bg-purple-500/10"
        >
          {t("Reset filters")}
        </button>
      </div>

      {hasSearchQuery && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-100">
          {t(
            "Changing any filter will clear the current search and switch back to TMDB discover results.",
          )}
        </div>
      )}

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">
          {t("Genre")}
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 pr-1 scroll-smooth sm:pb-4">
          <button
            type="button"
            onClick={() => onGenreChange(null)}
            className={`${GENRE_BTN_BASE} ${
              selectedGenre === null
                ? "scale-105 border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            {t("All")}
          </button>
          {genresLoading && genres.length === 0 && (
            <div aria-hidden="true" className="flex gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-white/5"
                />
              ))}
            </div>
          )}
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => onGenreChange(genre.id)}
              className={`${GENRE_BTN_BASE} ${
                selectedGenre === genre.id
                  ? "scale-105 border-purple-600 bg-purple-600 text-white shadow-xl shadow-purple-600/20"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {t(genre.name)}
            </button>
          ))}
        </div>
        {genresError && (
          <div
            role="alert"
            aria-busy={genresLoading}
            className="mt-2 flex flex-wrap items-center gap-3 text-sm text-red-300"
          >
            <span>{t("Could not load genres.")}</span>
            <button
              type="button"
              onClick={onRetryGenres}
              disabled={genresLoading}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-300/30 px-3 font-semibold text-white transition-colors hover:bg-red-300/10 disabled:cursor-wait disabled:opacity-70"
            >
              {genresLoading && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
                />
              )}
              {t("Try again")}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-2">
          <span className={LABEL_CLASS}>{t("Release Year")}</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder={t("e.g. 2024")}
            value={yearInput}
            onChange={(e) =>
              setYearInput(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className={INPUT_CLASS}
          />
        </label>

        <FilterSelect
          label="Minimum Rating"
          value={minRating}
          options={MIN_RATING_OPTIONS}
          isOpen={openSelect === "rating"}
          onToggle={() => toggleSelect("rating")}
          onClose={() => toggleSelect(null)}
          onChange={onRatingChange}
        />

        <FilterSelect
          label="Sort By"
          value={sortBy || DEFAULT_DISCOVER_SORT}
          options={DISCOVER_SORT_OPTIONS}
          isOpen={openSelect === "sort"}
          onToggle={() => toggleSelect("sort")}
          onClose={() => toggleSelect(null)}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
};

export default MoviesFilters;
