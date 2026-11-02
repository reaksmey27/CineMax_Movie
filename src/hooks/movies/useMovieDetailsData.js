import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";

export default function useMovieDetailsData(id) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbService.getMovieDetails(id);
        if (!ignore && data) {
          setMovie(tmdbService.formatMovieData(data));
        }
      } catch (error) {
        if (!ignore) {
          setError(error.status === 404 ? "not-found" : "unavailable");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      ignore = true;
    };
  }, [id, retryVersion]);

  return {
    movie,
    loading,
    error,
    retry: () => setRetryVersion((value) => value + 1),
  };
}
