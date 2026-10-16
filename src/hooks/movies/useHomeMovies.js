import { useState, useEffect, useCallback } from "react";
import { tmdbService } from "../../services/tmdbService";
import { Retrier } from "@humanwhocodes/retry";

const retrier = new Retrier(
  (error) => {
    // Retry on network errors, timeouts, or if the browser is offline
    return (
      !window.navigator.onLine ||
      error.name === "AbortError" ||
      error.message?.includes("fetch")
    );
  },
  { timeout: 30_000 },
);

const toResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || [];
};

const getReleaseTimestamp = (movie) => {
  const rawDate = movie.release_date || movie.first_air_date;
  if (!rawDate) return 0;

  const timestamp = new Date(rawDate).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const compareHeroMovies = (a, b) => {
  const now = Date.now();
  const aUpcoming = getReleaseTimestamp(a) > now;
  const bUpcoming = getReleaseTimestamp(b) > now;

  if (aUpcoming !== bUpcoming) {
    return aUpcoming ? 1 : -1;
  }

  const dateDelta = getReleaseTimestamp(b) - getReleaseTimestamp(a);
  if (dateDelta !== 0) return dateDelta;

  const popularityDelta = Number(b.popularity || 0) - Number(a.popularity || 0);
  if (popularityDelta !== 0) return popularityDelta;

  return Number(b.vote_average || 0) - Number(a.vote_average || 0);
};

const buildFeaturedMovies = (sources) => {
  const seen = new Map();

  sources.flat().forEach((movie) => {
    if (!movie?.id) return;

    const existing = seen.get(movie.id);
    if (!existing || compareHeroMovies(movie, existing) < 0) {
      seen.set(movie.id, movie);
    }
  });

  return [...seen.values()].sort(compareHeroMovies);
};

const useHomeMovies = () => {
  const [movies, setMovies] = useState({
    featured: [],
    nowPlaying: [],
    trending: [],
    upcoming: [],
    topRated: [],
    action: [],
    sciFi: [],
    comedy: [],
    animation: [],
    crime: [],
    fantasy: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await retrier.retry(() =>
        Promise.all([
          tmdbService.getNowPlayingMovies(),
          tmdbService.getTrendingMovies(),
          tmdbService.getUpcomingMovies(),
          tmdbService.getTopRatedMovies(),
          tmdbService.getPopularMovies(),
          tmdbService.getMoviesByGenre(28),
          tmdbService.getMoviesByGenre(878),
          tmdbService.getMoviesByGenre(35),
          tmdbService.getMoviesByGenre(16),
          tmdbService.getMoviesByGenre(80),
          tmdbService.getMoviesByGenre(14),
        ]),
      );

      const [
        nowPlayingData,
        trendingData,
        upcomingData,
        topRatedData,
        popularData,
        actionRes,
        sciFiRes,
        comedyRes,
        animationRes,
        crimeRes,
        fantasyRes,
      ] = data;

      const nowPlaying = toResults(nowPlayingData);
      const trending = toResults(trendingData);
      const upcoming = toResults(upcomingData);
      const topRated = toResults(topRatedData);
      const popular = toResults(popularData);

      setMovies({
        featured: buildFeaturedMovies([
          nowPlaying,
          trending,
          upcoming,
          popular,
          topRated,
        ])
          .slice(0, 6)
          .map(tmdbService.formatMovieData),
        nowPlaying: nowPlaying.map(tmdbService.formatMovieData),
        trending: trending.map(tmdbService.formatMovieData),
        upcoming: upcoming.map(tmdbService.formatMovieData),
        topRated: topRated.map(tmdbService.formatMovieData),
        action: toResults(actionRes).map(tmdbService.formatMovieData),
        sciFi: toResults(sciFiRes).map(tmdbService.formatMovieData),
        comedy: toResults(comedyRes).map(tmdbService.formatMovieData),
        animation: toResults(animationRes).map(tmdbService.formatMovieData),
        crime: toResults(crimeRes).map(tmdbService.formatMovieData),
        fantasy: toResults(fantasyRes).map(tmdbService.formatMovieData),
      });
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      let errorMessage =
        err.message || "Failed to sync with cinematic database.";

      // Provide more helpful error messages
      if (
        err.message?.includes("Invalid TMDB credentials") ||
        err.message?.includes("TMDB credentials are missing") ||
        err.message?.includes("401")
      ) {
        errorMessage =
          "Invalid TMDB credentials. Update VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file with a valid TMDB credential from https://www.themoviedb.org/settings/api, then restart Vite.";
      } else if (
        err.message?.includes("Network error") ||
        err.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error. Please check your internet connection or try using a VPN.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMovies();
  }, [fetchAllMovies]);

  return { movies, loading, error, retry: fetchAllMovies };
};

export default useHomeMovies;
