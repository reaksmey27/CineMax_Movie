import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";

export default function useMovieDetailsData(id) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await tmdbService.getMovieDetails(id);
        if (!ignore && data) {
          setMovie(tmdbService.formatMovieData(data));
        }
      } catch (error) {
        if (!ignore) {
          console.error("Error fetching movie details:", error);
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
  }, [id]);

  return { movie, loading };
}
