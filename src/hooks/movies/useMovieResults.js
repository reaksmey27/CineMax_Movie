import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";

export default function useMovieResults({
  collection,
  minRating,
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

  useEffect(() => {
    let ignore = false;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (searchQuery.trim()) {
          response = await tmdbService.searchMovies(searchQuery, page);
        } else if (collection) {
          response = await tmdbService.getMovieCollection(collection, page);
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
  }, [
    collection,
    minRating,
    page,
    releaseYear,
    searchQuery,
    selectedGenre,
    sortBy,
  ]);

  return { movies, loading, totalPages, error, setError };
}
