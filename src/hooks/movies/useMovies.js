import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_DISCOVER_SORT } from "../../config/movieFilters";

import { parseMovieSearchParams } from "./movieSearchParams";
import useMovieGenres from "./useMovieGenres";
import useMovieResults from "./useMovieResults";

const useMovies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── URL State: parse filters from query string ───────────────────────────────

  const filters = parseMovieSearchParams(searchParams);
  const {
    page,
    selectedGenre,
    collectionTitle,
    searchQuery,
    releaseYear,
    minRating,
    sortBy,
    hasActiveFilters,
  } = filters;
  const { genres, genresLoading, genresError, retryGenres } = useMovieGenres();
  const { movies, loading, totalPages, error, setError } =
    useMovieResults(filters);

  // ─── URL Helpers: write filter updates ────────────────────────────────────────

  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (Object.keys(updates).some((key) => key !== "page"))
            next.delete("collection");
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || value === undefined) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ─── Actions: search, filter & pagination handlers ────────────────────────────

  const handleGenreChange = useCallback(
    (genreId) => {
      updateParams({ genre: genreId, page: 1 });
      setError(null);
    },
    [setError, updateParams],
  );

  const handleSearch = useCallback(
    (value) => {
      updateParams({ q: value, page: 1 });
      setError(null);
    },
    [setError, updateParams],
  );

  const clearSearch = useCallback(() => {
    updateParams({ q: null, page: 1 });
    setError(null);
  }, [setError, updateParams]);

  const handleYearChange = useCallback(
    (value) => {
      updateParams({ year: value || null, page: 1 });
      setError(null);
    },
    [setError, updateParams],
  );

  const handleRatingChange = useCallback(
    (value) => {
      updateParams({ rating: value || null, page: 1 });
      setError(null);
    },
    [setError, updateParams],
  );

  const handleSortChange = useCallback(
    (value) => {
      updateParams({
        sort: value === DEFAULT_DISCOVER_SORT ? null : value,
        page: 1,
      });
      setError(null);
    },
    [setError, updateParams],
  );

  const clearFilters = useCallback(() => {
    updateParams({
      genre: null,
      year: null,
      rating: null,
      sort: null,
      page: 1,
    });
    setError(null);
  }, [setError, updateParams]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        updateParams({ page: newPage });
      }
    },
    [totalPages, updateParams],
  );

  return {
    collectionTitle,
    movies,
    genres,
    genresLoading,
    genresError,
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
    handleYearChange,
    handleRatingChange,
    handleSortChange,
    clearFilters,
    handlePageChange,
    retryGenres,
  };
};

export default useMovies;
