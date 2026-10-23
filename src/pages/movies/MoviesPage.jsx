import { XMarkIcon } from "@heroicons/react/24/outline";

import MovieGrid from "../../components/ui/MovieGrid";
import MovieGridSkeleton from "../../components/ui/MovieGridSkeleton";
import PageError from "../../components/ui/PageError";
import { useLanguage } from "../../context/LanguageContext";
import useMovies from "../../hooks/movies/useMovies";
import MovieHeader from "./components/MoviesHeader";
import Pagination from "./components/Pagination";
import SearchSuggestions from "./components/SearchSuggestions";

// ─── Helpers: empty-state copy for search/filter ──────────────────────────────

const getEmptyState = (t, searchQuery, hasActiveFilters) => {
  if (searchQuery && hasActiveFilters)
    return {
      title: t("No Movies Match These Filters"),
      message: t(
        "Try widening your filters or reset them to discover more results.",
      ),
    };
  if (searchQuery)
    return {
      title: t("No Search Results"),
      message: t(
        'We couldn’t find any movies for "{query}". Try a different title or keyword.',
        { query: searchQuery },
      ),
    };
  if (hasActiveFilters)
    return {
      title: t("No Movies Match These Filters"),
      message: t(
        "Try widening your filters or reset them to discover more results.",
      ),
    };
  return {
    title: t("No Movies Found"),
    message: t(
      "Try browsing a different genre or checking back for more titles.",
    ),
  };
};

// ─── MoviesPage: browse, search & filter page ─────────────────────────────────

const MoviesPage = () => {
  const { t } = useLanguage();
  const {
    collectionTitle,
    movies,
    genres,
    genresLoading,
    genresError,
    selectedGenre,
    searchQuery,
    releaseYear,
    minRating,
    runtime,
    sortBy,
    hasActiveFilters,
    loading,
    page,
    totalPages,
    error,
    handleGenreChange,
    handleSearch,
    clearSearch,
    handlePageChange,
    retryGenres,
    handleYearChange,
    handleRatingChange,
    handleRuntimeChange,
    handleSortChange,
    clearFilters,
  } = useMovies();

  const resetResults = hasActiveFilters
    ? clearFilters
    : searchQuery
      ? clearSearch
      : undefined;
  const resetLabel = hasActiveFilters ? t("Reset Filters") : t("Clear Search");
  const { title: emptyTitle, message: emptyMessage } = getEmptyState(
    t,
    searchQuery,
    hasActiveFilters,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      {/* ── Background glows ── */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-purple-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="mx-auto max-w-350">
        <MovieHeader
          collectionTitle={collectionTitle}
          searchQuery={searchQuery}
          page={page}
          totalPages={totalPages}
          genres={genres}
          genresLoading={genresLoading}
          genresError={genresError}
          onRetryGenres={retryGenres}
          selectedGenre={selectedGenre}
          releaseYear={releaseYear}
          minRating={minRating}
          runtime={runtime}
          onRuntimeChange={handleRuntimeChange}
          sortBy={sortBy}
          hasActiveFilters={hasActiveFilters}
          onSearch={handleSearch}
          onClear={clearSearch}
          onGenreChange={handleGenreChange}
          onYearChange={handleYearChange}
          onRatingChange={handleRatingChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
        />

        {error ? (
          <PageError
            message={error}
            buttonLabel={t("Retry Connection")}
            buttonColor="bg-white text-black hover:bg-red-500 hover:text-white"
            icon={XMarkIcon}
            iconColor="text-red-500"
            borderColor="border-red-500/10 bg-red-500/5"
          />
        ) : loading ? (
          <MovieGridSkeleton />
        ) : (
          <>
            {movies.length === 0 && searchQuery && !hasActiveFilters && (
              <SearchSuggestions key={searchQuery} query={searchQuery} onSearch={handleSearch} />
            )}
            <MovieGrid
              movies={movies}
              onReset={resetResults}
              resetLabel={resetLabel}
              emptyTitle={emptyTitle}
              emptyMessage={emptyMessage}
            />
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
