import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tmdbService } from "../../services/tmdbService";
import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORT_OPTIONS,
} from "../../pages/movies/constants";

const DISCOVER_SORT_VALUES = new Set(
  DISCOVER_SORT_OPTIONS.map((option) => option.value),
);

const useMovies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const genreParam = searchParams.get("genre");
  const parsedGenre = genreParam ? parseInt(genreParam, 10) : null;
  const selectedGenre = Number.isNaN(parsedGenre) ? null : parsedGenre;
  const searchQuery = searchParams.get("q") || "";
  const releaseYearParam = searchParams.get("year") || "";
  const minRatingParam = searchParams.get("rating") || "";
  const sortParam = searchParams.get("sort") || DEFAULT_DISCOVER_SORT;
  const releaseYear = /^\d{4}$/.test(releaseYearParam) ? releaseYearParam : "";
  const minRating = /^\d+(\.\d+)?$/.test(minRatingParam) ? minRatingParam : "";
  const sortBy = DISCOVER_SORT_VALUES.has(sortParam)
    ? sortParam
    : DEFAULT_DISCOVER_SORT;

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const hasActiveFilters = Boolean(
    selectedGenre ||
    releaseYear ||
    minRating ||
    sortBy !== DEFAULT_DISCOVER_SORT,
  );

  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
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

  useEffect(() => {
    let ignore = false;

    const fetchGenres = async () => {
      try {
        const genreData = await tmdbService.getGenres();
        if (!ignore) {
          setGenres(genreData);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching genres:", err);
        }
      }
    };

    fetchGenres();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (searchQuery.trim()) {
          response = await tmdbService.searchMovies(searchQuery, page);
        } else {
          response = await tmdbService.discoverMovies(page, {
            genreId: selectedGenre,
            releaseYear,
            minRating,
            sortBy,
          });
        }

        if (!ignore && response?.results) {
          setMovies(response.results.map(tmdbService.formatMovieData));
          setTotalPages(Math.min(response.total_pages, 100));
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching movies:", err);
          let errorMessage =
            "Unable to connect to the movie database. Please check your network.";

          if (
            err.message?.includes("Invalid TMDB credentials") ||
            err.message?.includes("TMDB credentials are missing") ||
            err.message?.includes("401")
          ) {
            errorMessage =
              "Invalid TMDB credentials. Update VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file, then restart Vite.";
          } else if (
            err.message?.includes("Network error") ||
            err.message?.includes("Failed to fetch")
          ) {
            errorMessage =
              "Network error. Please check your internet connection or try using a VPN.";
          }

          setError(errorMessage);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchMovies, searchQuery ? 500 : 0);
    return () => {
      ignore = true;
      clearTimeout(debounceTimer);
    };
  }, [minRating, page, releaseYear, searchQuery, selectedGenre, sortBy]);

  const handleGenreChange = useCallback(
    (genreId) => {
      updateParams({ genre: genreId, page: 1, q: null });
      setError(null);
    },
    [updateParams],
  );

  const handleSearch = useCallback(
    (value) => {
      updateParams({ q: value, page: 1 });
      setError(null);
    },
    [updateParams],
  );

  const clearSearch = useCallback(() => {
    updateParams({ q: null, page: 1 });
    setError(null);
  }, [updateParams]);

  const handleYearChange = useCallback(
    (value) => {
      updateParams({ year: value || null, page: 1, q: null });
      setError(null);
    },
    [updateParams],
  );

  const handleRatingChange = useCallback(
    (value) => {
      updateParams({ rating: value || null, page: 1, q: null });
      setError(null);
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (value) => {
      updateParams({
        sort: value === DEFAULT_DISCOVER_SORT ? null : value,
        page: 1,
        q: null,
      });
      setError(null);
    },
    [updateParams],
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
  }, [updateParams]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        updateParams({ page: newPage });
      }
    },
    [totalPages, updateParams],
  );

  return {
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
    handleYearChange,
    handleRatingChange,
    handleSortChange,
    clearFilters,
    handlePageChange,
  };
};

export default useMovies;
