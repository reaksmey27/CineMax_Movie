import { useState, useEffect, useCallback, useRef } from "react";
import { tmdbService } from "../../services/tmdbService";

const LOADERS = {
  trending: () => tmdbService.getTrendingMovies(),
  topRated: () => tmdbService.getTopRatedMovies(),
  nowPlaying: () => tmdbService.getNowPlayingMovies(),
  upcoming: () => tmdbService.getUpcomingMovies(),
  action: () => tmdbService.getMoviesByGenre(28),
  sciFi: () => tmdbService.getMoviesByGenre(878),
  comedy: () => tmdbService.getMoviesByGenre(35),
  animation: () => tmdbService.getMoviesByGenre(16),
  crime: () => tmdbService.getMoviesByGenre(80),
  fantasy: () => tmdbService.getMoviesByGenre(14),
  drama: () => tmdbService.getMoviesByGenre(18),
  romance: () => tmdbService.getMoviesByGenre(10749),
  horror: () => tmdbService.getMoviesByGenre(27),
  mystery: () => tmdbService.getMoviesByGenre(9648),
  family: () => tmdbService.getMoviesByGenre(10751),
};

const initialSections = () =>
  Object.fromEntries(
    Object.keys(LOADERS).map((key) => [
      key,
      { movies: [], loading: true, error: false },
    ]),
  );

const useHomeMovies = () => {
  const [sections, setSections] = useState(initialSections);
  const mounted = useRef(false);
  const requests = useRef({});

  const loadSection = useCallback(async (key) => {
    if (!LOADERS[key] || !mounted.current) return;
    const request = Symbol(key);
    requests.current[key] = request;
    const isCurrent = () =>
      mounted.current && requests.current[key] === request;
    setSections((current) => ({
      ...current,
      [key]: { ...current[key], loading: true, error: false },
    }));
    try {
      const data = await LOADERS[key]();
      const results = Array.isArray(data) ? data : data?.results || [];
      const movies = results.map(tmdbService.formatMovieData);
      if (isCurrent())
        setSections((current) => ({
          ...current,
          [key]: { movies, loading: false, error: false },
        }));
    } catch {
      if (isCurrent())
        setSections((current) => ({
          ...current,
          [key]: { ...current[key], loading: false, error: true },
        }));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    Object.keys(LOADERS).forEach((key) => {
      void loadSection(key);
    });
    return () => {
      mounted.current = false;
      requests.current = {};
    };
  }, [loadSection]);

  return { sections, retrySection: loadSection };
};

export default useHomeMovies;
