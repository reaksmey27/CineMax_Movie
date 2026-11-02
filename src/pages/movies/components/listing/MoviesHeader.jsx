import { memo, useState } from "react";

import { useLanguage } from "../../../../context/LanguageContext";
import MoviesFilters from "../filters/MoviesFilters";
import ActiveFilterChips from "../filters/ActiveFilterChips";
import MoviesSearch from "../search/MoviesSearch";
import { getHeadingState, getSubtitle } from "./moviesHeaderCopy";

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

  const [openSelect, setOpenSelect] = useState(null);

  const [prevFilterSort, setPrevFilterSort] = useState(
    `${minRating}|${sortBy}|${runtime}|${country}|${releaseYear}`,
  );
  const filterSortKey = `${minRating}|${sortBy}|${runtime}|${country}|${releaseYear}`;
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
        hasActiveFilters={hasActiveFilters}
        hasSearchQuery={hasSearchQuery}
        minRating={minRating}
        country={country}
        onCountryChange={onCountryChange}
        runtime={runtime}
        onRuntimeChange={onRuntimeChange}
        onClearFilters={() => {
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
        releaseYear={releaseYear}
        onYearChange={onYearChange}
      />
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
        onYearChange={onYearChange}
        onRatingChange={onRatingChange}
        onRuntimeChange={onRuntimeChange}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default memo(MoviesHeader);
