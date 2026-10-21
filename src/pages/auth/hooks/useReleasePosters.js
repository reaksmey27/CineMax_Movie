import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";
import { posterCards } from "../authPosterCards";

// ─── useReleasePosters: fresh TMDB posters for the auth wall ──────────────────

export const useReleasePosters = () => {
  const [movieCards, setMovieCards] = useState(posterCards);

  useEffect(() => {
    let cancelled = false;

    const loadNewReleasePosters = async () => {
      try {
        const [nowPlaying, trending, upcoming] = await Promise.allSettled([
          tmdbService.getNowPlayingMovies(),
          tmdbService.getTrendingMovies(),
          tmdbService.getUpcomingMovies(),
        ]);

        const nowPlayingResults =
          nowPlaying.status === "fulfilled" ? nowPlaying.value : [];
        const trendingResults =
          trending.status === "fulfilled" ? trending.value : [];
        const upcomingResults =
          upcoming.status === "fulfilled" ? upcoming.value : [];
        const mergedResults = [
          ...nowPlayingResults,
          ...trendingResults,
          ...upcomingResults,
        ];
        const uniqueMovies = mergedResults
          .filter((movie) => movie?.poster_path || movie?.backdrop_path)
          .filter(
            (movie, index, array) =>
              array.findIndex((item) => item.id === movie.id) === index,
          )
          .sort((left, right) => {
            const leftDate = new Date(
              left.release_date || left.first_air_date || 0,
            ).getTime();
            const rightDate = new Date(
              right.release_date || right.first_air_date || 0,
            ).getTime();
            const leftPopularity = left.popularity || 0;
            const rightPopularity = right.popularity || 0;

            return rightDate - leftDate || rightPopularity - leftPopularity;
          })
          .slice(0, 6)
          .map((movie, index) => {
            const formatted = tmdbService.formatMovieData(movie);

            return {
              title: formatted.title || "New Release",
              subtitle:
                formatted.subtitle ||
                (movie.release_date ? "New Release" : "Trending Now"),
              image: formatted.backdropImage || formatted.posterImage,
              imagePosition:
                movie.backdrop_path && index < 2
                  ? "center top"
                  : movie.poster_path
                    ? "center 15%"
                    : "center center",
              tone: "from-slate-900 to-slate-700",
              rotation: "rotate-0",
            };
          });

        if (!cancelled && uniqueMovies.length > 0) {
          setMovieCards(uniqueMovies);
        }
      } catch {
        if (!cancelled) {
          setMovieCards(posterCards);
        }
      }
    };

    loadNewReleasePosters();
    const refreshId = window.setInterval(loadNewReleasePosters, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshId);
    };
  }, []);

  return movieCards;
};
