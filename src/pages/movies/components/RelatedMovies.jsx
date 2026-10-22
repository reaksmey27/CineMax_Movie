import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";
import { useLanguage } from "../../../context/LanguageContext";
import MovieCard from "../../../components/ui/MovieCard";

export default function RelatedMovies({ movieId }) {
  const { t } = useLanguage();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    movies: [],
    error: false,
  });
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const movies = await tmdbService.getRelatedMovies(movieId);
        if (!ignore)
          setState({
            loading: false,
            movies: movies.map(tmdbService.formatMovieData),
            error: false,
          });
      } catch {
        if (!ignore) setState({ loading: false, movies: [], error: true });
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [movieId, attempt]);

  return (
    <section aria-labelledby="related-movies-heading" aria-busy={state.loading}>
      <h2
        id="related-movies-heading"
        className="mb-6 text-2xl font-bold text-[var(--color-text)]"
      >
        {t("Related movies")}
      </h2>
      {state.loading ? (
        <div role="status">
          <span className="sr-only">{t("Loading related movies...")}</span>
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((key) => (
              <div
                key={key}
                className="aspect-[2/3] motion-safe:animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]"
              />
            ))}
          </div>
        </div>
      ) : state.error ? (
        <div role="alert" className="text-sm text-[var(--color-text-muted)]">
          <p>{t("Could not load related movies.")}</p>
          <button
            type="button"
            onClick={() => {
              setState({ loading: true, movies: [], error: false });
              setAttempt((value) => value + 1);
            }}
            className="mt-3 min-h-11 rounded-lg bg-purple-600 px-4 font-semibold text-white hover:bg-purple-500"
          >
            {t("Try again")}
          </button>
        </div>
      ) : state.movies.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {state.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} headingLevel="h3" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          {t("No related movies available yet.")}
        </p>
      )}
    </section>
  );
}
