import { XMarkIcon } from "@heroicons/react/24/outline";

import MovieGrid from "../../components/ui/MovieGrid";
import MovieGridSkeleton from "../../components/ui/MovieGridSkeleton";
import PageError from "../../components/ui/PageError";
import useMovies from "../../hooks/movies/useMovies";
import MovieHeader from "./components/MoviesHeader";
import Pagination from "./components/Pagination";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEmptyState = (searchQuery, hasActiveFilters) => {
  if (searchQuery)
    return {
      title: "No Search Results",
      message: `We couldn't find any movies for "${searchQuery}". Try a different title or keyword.`,
    };
  if (hasActiveFilters)
    return {
      title: "No Movies Match These Filters",
      message:
        "Try widening your filters or reset them to discover more results.",
    };
  return {
    title: "No Movies Found",
    message: "Try browsing a different genre or checking back for more titles.",
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

const MoviesPage = () => {
  const {
    collectionTitle,
    movies,
    genres,
    selectedGenre,
    searchQuery,
    releaseYear,
    minRating,
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
    handleYearChange,
    handleRatingChange,
    handleSortChange,
    clearFilters,
  } = useMovies();

  const resetResults = searchQuery
    ? clearSearch
    : hasActiveFilters
      ? clearFilters
      : undefined;
  const resetLabel = searchQuery ? "Clear Search" : "Reset Filters";
  const { title: emptyTitle, message: emptyMessage } = getEmptyState(
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
          selectedGenre={selectedGenre}
          releaseYear={releaseYear}
          minRating={minRating}
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
            buttonLabel="Retry Connection"
            buttonColor="bg-white text-black hover:bg-red-500 hover:text-white"
            icon={XMarkIcon}
            iconColor="text-red-500"
            borderColor="border-red-500/10 bg-red-500/5"
          />
        ) : loading ? (
          <MovieGridSkeleton />
        ) : (
          <>
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
