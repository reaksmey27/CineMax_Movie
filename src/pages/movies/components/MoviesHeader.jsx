import { memo, useEffect, useState } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import MoviesFilters from "./MoviesFilters";
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
  const [prevReleaseYear, setPrevReleaseYear] = useState(releaseYear);
  if (prevReleaseYear !== releaseYear) {
    setPrevReleaseYear(releaseYear);
    setYearInput(releaseYear);
  }

  const [prevFilterSort, setPrevFilterSort] = useState(
    `${minRating}|${sortBy}|${runtime}`,
  );
  const filterSortKey = `${minRating}|${sortBy}|${runtime}`;
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

      <MoviesFilters
        genres={genres}
        genresLoading={genresLoading}
        genresError={genresError}
        hasActiveFilters={hasActiveFilters || Boolean(yearInput)}
        hasSearchQuery={hasSearchQuery}
        minRating={minRating}
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
  );
};

export default memo(MoviesHeader);
