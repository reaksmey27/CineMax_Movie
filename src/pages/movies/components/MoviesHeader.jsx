import { memo, useEffect, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { DEFAULT_DISCOVER_SORT } from "../../../config/movieFilters";

import { useLanguage } from "../../../context/LanguageContext";
import MoviesFilters from "./MoviesFilters";
import ActiveFilterChips from "./ActiveFilterChips";
import MoviesSearch from "./MoviesSearch";
import { getHeadingState, getSubtitle } from "./moviesHeaderCopy";

const YEAR_DEBOUNCE = 250;

// ─── MoviesHeader: title, search & filters ────────────────────────────────────

const MoviesHeader = ({
  collectionTitle,
  searchQuery,
  page,
  totalPages,
  genres,
  genresLoading,
  genresError,
  onRetryGenres,
  selectedGenre,
  releaseYear,
  minRating,
  country,
  onCountryChange,
  runtime,
  onRuntimeChange,
  sortBy,
  hasActiveFilters,
  onSearch,
  onClear,
  onGenreChange,
  onYearChange,
  onRatingChange,
  onSortChange,
  onClearFilters,
}) => {
  const { t } = useLanguage();
  // ─── State: search input & refs ──────────────────────────────────────────────

  const [yearInput, setYearInput] = useState(releaseYear);
  const [openSelect, setOpenSelect] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const activeFilterCount = [
    selectedGenre !== null,
    releaseYear,
    minRating,
    country,
    runtime,
    sortBy && sortBy !== DEFAULT_DISCOVER_SORT,
    collectionTitle,
  ].filter(Boolean).length;
  const [prevReleaseYear, setPrevReleaseYear] = useState(releaseYear);
  if (prevReleaseYear !== releaseYear) {
    setPrevReleaseYear(releaseYear);
    setYearInput(releaseYear);
  }

  const [prevFilterSort, setPrevFilterSort] = useState(
    `${minRating}|${sortBy}|${runtime}|${country}`,
  );
  const filterSortKey = `${minRating}|${sortBy}|${runtime}|${country}`;
  if (prevFilterSort !== filterSortKey) {
    setPrevFilterSort(filterSortKey);
    setOpenSelect(null);
  }

  const hasSearchQuery = Boolean(searchQuery.trim());
  const heading =
    collectionTitle && !hasSearchQuery
      ? { top: collectionTitle, accent: "Movies", suffix: "" }
      : getHeadingState(hasSearchQuery, hasActiveFilters);
  const subtitle =
    collectionTitle && !hasSearchQuery
      ? t(
          "Browse {collection} movies. Select a filter to explore other movies.",
          {
            collection: t(collectionTitle),
          },
        )
      : getSubtitle(
          t,
          hasSearchQuery,
          hasActiveFilters,
          searchQuery,
          page,
          totalPages,
        );

  const toggleSelect = (key) =>
    setOpenSelect((current) => (current === key ? null : key));
  useEffect(() => {
    if (yearInput === releaseYear || (yearInput !== "" && yearInput.length < 4))
      return undefined;
    const id = window.setTimeout(() => onYearChange(yearInput), YEAR_DEBOUNCE);
    return () => window.clearTimeout(id);
  }, [onYearChange, releaseYear, yearInput]);

  // ─── Render: title, search bar & filters ─────────────────────────────────────

  return (
    <div className="mb-10 flex flex-col gap-6 sm:mb-16 sm:gap-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-8">
        <div className="space-y-3">
          <h1 className="page-heading page-heading--violet">
            {t(heading.top)} <br />
            <span>{t(heading.accent)}</span>
            {t(heading.suffix)}
          </h1>
          <p className="max-w-md text-sm font-medium text-gray-400">
            {subtitle}
          </p>
        </div>

        <MoviesSearch
          searchQuery={searchQuery}
          onSearch={onSearch}
          onClear={onClear}
        />
      </div>

      <button
        type="button"
        aria-expanded={filtersExpanded}
        aria-controls="movie-filter-panel"
        onClick={() => {
          setOpenSelect(null);
          setFiltersExpanded((expanded) => !expanded);
        }}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-purple-400 sm:hidden"
      >
        <AdjustmentsHorizontalIcon
          aria-hidden="true"
          className="h-5 w-5 text-purple-400"
        />
        <span>{t("Filters ({count})", { count: activeFilterCount })}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`ml-auto h-4 w-4 ${filtersExpanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id="movie-filter-panel"
        className={`${filtersExpanded ? "block" : "hidden"} sm:block`}
      >
        <MoviesFilters
          genres={genres}
          genresLoading={genresLoading}
          genresError={genresError}
          hasActiveFilters={hasActiveFilters || Boolean(yearInput)}
          hasSearchQuery={hasSearchQuery}
          minRating={minRating}
          country={country}
          onCountryChange={onCountryChange}
          runtime={runtime}
          onRuntimeChange={onRuntimeChange}
          onClearFilters={() => {
            setYearInput("");
            setOpenSelect(null);
            onClearFilters();
          }}
          onGenreChange={onGenreChange}
          onRatingChange={onRatingChange}
          onRetryGenres={onRetryGenres}
          onSortChange={onSortChange}
          openSelect={openSelect}
          selectedGenre={selectedGenre}
          sortBy={sortBy}
          toggleSelect={toggleSelect}
          yearInput={yearInput}
          setYearInput={setYearInput}
        />
      </div>
      <ActiveFilterChips
        genres={genres}
        selectedGenre={selectedGenre}
        releaseYear={releaseYear}
        minRating={minRating}
        country={country}
        onCountryChange={onCountryChange}
        runtime={runtime}
        sortBy={sortBy}
        onGenreChange={onGenreChange}
        onYearChange={(value) => {
          setYearInput(value);
          onYearChange(value);
        }}
        onRatingChange={onRatingChange}
        onRuntimeChange={onRuntimeChange}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default memo(MoviesHeader);
