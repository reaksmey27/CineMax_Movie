import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";
import { filteredSearch } from "./filteredSearch";
import { DEFAULT_DISCOVER_SORT } from "../../config/movieFilters";

export default function useMovieResults({
  collection,
  minRating,
  runtime,
  page,
  releaseYear,
  searchQuery,
  selectedGenre,
  sortBy,
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!navigator.onLine) throw new Error("Failed to fetch: offline");
        let response;
        if (searchQuery.trim()) {
          const hasSearchFilters =
            selectedGenre ||
            releaseYear ||
            minRating ||
            runtime ||
            sortBy !== DEFAULT_DISCOVER_SORT;
          response = hasSearchFilters
            ? await filteredSearch(
                (searchPage) =>
                  tmdbService.searchMovies(
                    searchQuery,
                    searchPage,
                    releaseYear,
                  ),
                {
                  selectedGenre,
                  releaseYear,
                  minRating,
                  runtime,
                  sortBy,
                  page,
                },
                () => ignore,
                tmdbService.getMovieRuntime,
              )
            : await tmdbService.searchMovies(searchQuery, page);
        } else if (collection && !runtime) {
          response = await tmdbService.getMovieCollection(collection, page);
        } else {
          response = await tmdbService.discoverMovies(page, {
            genreId: selectedGenre,
            releaseYear,
            minRating,
            runtime,
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
  }, [
    collection,
    minRating,
    runtime,
    page,
    releaseYear,
    searchQuery,
    selectedGenre,
    sortBy,
    retryVersion,
  ]);

  return {
    movies,
    loading,
    totalPages,
    error,
    setError,
    retry: () => setRetryVersion((version) => version + 1),
  };
}
