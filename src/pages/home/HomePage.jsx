import { memo, useState } from "react";
import HeroSection from "./components/HeroSection";
import HeroSkeleton from "./components/HeroSkeleton";
import MovieSlider from "./components/MovieSlider";
import MovieSliderSkeleton from "../../components/ui/MovieSliderSkeleton";
import useHomeMovies from "../../hooks/movies/useHomeMovies";

const ROWS = [
  ["topRated", "Top Rated", "/movies?collection=top-rated"],
  ["nowPlaying", "Now Playing", "/movies?collection=now-playing"],
  ["trending", "Trending", "/trending"],
  ["upcoming", "Upcoming", "/upcoming"],
  ["action", "Action", "/movies?genre=28"],
  ["sciFi", "Sci-Fi", "/movies?genre=878"],
  ["comedy", "Comedy", "/movies?genre=35"],
  ["animation", "Animation", "/movies?genre=16"],
  ["crime", "Crime", "/movies?genre=80"],
  ["fantasy", "Fantasy", "/movies?genre=14"],
];

const SectionError = ({ title, onRetry }) => (
  <section className="mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 sm:mx-6 lg:mx-24">
    <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
    <p role="status" className="mt-2 text-sm text-[var(--color-text-muted)]">
      These movies could not load. You can keep browsing or try again.
    </p>
    <button
      type="button"
      onClick={onRetry}
      aria-label={`Retry ${title}`}
      className="mt-4 min-h-11 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
    >
      Try again
    </button>
  </section>
);

const HomePage = () => {
  const { sections, retrySection } = useHomeMovies();
  const trending = sections.trending;
  const [showAllGenres, setShowAllGenres] = useState(false);

  return (
    <main id="home" className="min-h-screen bg-slate-950">
      <h1 className="sr-only">
        CineMax - discover movies, trailers, and your next favorite
      </h1>
      {trending.loading ? (
        <div aria-busy="true" aria-label="Loading featured movies">
          <HeroSkeleton />
        </div>
      ) : trending.error ? (
        <div className="pb-6 pt-28 sm:pt-40">
          <SectionError
            title="Featured movies"
            onRetry={() => retrySection("trending")}
          />
        </div>
      ) : trending.movies.length ? (
        <HeroSection trendingMovies={trending.movies} />
      ) : (
        <div className="px-4 pb-6 pt-28 text-[var(--color-text-muted)] sm:px-6 sm:pt-40">
          No featured movies are available right now. Explore the collections
          below.
        </div>
      )}

      <div className="relative z-30 mt-8 space-y-10 pb-14 sm:mt-16 sm:space-y-14 sm:pb-20">
        {(showAllGenres ? ROWS : ROWS.slice(0, 6)).map(
          ([key, title, viewAllTo]) => {
            const section = sections[key];
            if (section.loading)
              return (
                <div key={key} aria-busy="true" aria-label={`Loading ${title}`}>
                  <MovieSliderSkeleton />
                </div>
              );
            if (section.error)
              return (
                <SectionError
                  key={key}
                  title={title}
                  onRetry={() => retrySection(key)}
                />
              );
            if (!section.movies.length) return null;
            return (
              <MovieSlider
                key={key}
                title={title}
                movies={section.movies}
                viewAllTo={viewAllTo}
              />
            );
          },
        )}
        <div className="flex justify-center px-4">
          <button
            type="button"
            aria-expanded={showAllGenres}
            onClick={() => setShowAllGenres((current) => !current)}
            className="min-h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            {showAllGenres ? "Show fewer genres" : "Explore more genres"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default memo(HomePage);
