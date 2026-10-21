import { useCallback, useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";

export default function useMovieGenres() {
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState(false);
  const [genreRetry, setGenreRetry] = useState(0);

  const retryGenres = useCallback(() => {
    setGenreRetry((current) => current + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchGenres = async () => {
      setGenresLoading(true);
      try {
        const genreData = await tmdbService.getGenres();
        if (!ignore) {
          setGenres(genreData);
          setGenresError(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching genres:", err);
          setGenresError(true);
        }
      } finally {
        if (!ignore) {
          setGenresLoading(false);
        }
      }
    };

    fetchGenres();
    return () => {
      ignore = true;
    };
  }, [genreRetry]);

  return { genres, genresLoading, genresError, retryGenres };
}
