import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";
import { Retrier } from "@humanwhocodes/retry";

const retrier = new Retrier(
  (error) => {
    // Retry on network errors
    return !window.navigator.onLine || error.message?.includes("fetch");
  },
  { timeout: 30_000 },
);

const useUpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchUpcoming = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await retrier.retry(() =>
          tmdbService.getUpcomingMovies(),
        );
        const results = Array.isArray(response)
          ? response
          : response?.results || [];
        if (!ignore && results.length > 0) {
          setMovies(results.map(tmdbService.formatMovieData));
        }
      } catch (err) {
        if (ignore) {
          return;
        }

        console.error("Error fetching upcoming movies:", err);
        let errorMessage = "Could not predict the future.";

        if (
          err.message?.includes("Invalid TMDB credentials") ||
          err.message?.includes("TMDB credentials are missing") ||
          err.message?.includes("401")
        ) {
          errorMessage =
            "Invalid TMDB credentials. Update VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file.";
        } else if (
          err.message?.includes("Network error") ||
          err.message?.includes("Failed to fetch")
        ) {
          errorMessage = "Network error. Please check your connection.";
        }

        setError(errorMessage);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUpcoming();
    return () => {
      ignore = true;
    };
  }, []);

  return { movies, loading, error };
};

export default useUpcomingMovies;
