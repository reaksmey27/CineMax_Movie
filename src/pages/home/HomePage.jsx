import { memo } from "react";
import HeroSection from "./components/HeroSection";
import HeroSkeleton from "./components/HeroSkeleton";
import MovieSlider from "./components/MovieSlider";
import MovieSliderSkeleton from "../../components/ui/MovieSliderSkeleton";
import useHomeMovies from "../../hooks/movies/useHomeMovies";

const ROWS = [
  ["topRated", "Top Rated"], ["nowPlaying", "Now Playing"],
  ["trending", "Trending"], ["upcoming", "Upcoming"],
  ["action", "Action"], ["sciFi", "Sci-Fi"], ["comedy", "Comedy"],
  ["animation", "Animation"], ["crime", "Crime"], ["fantasy", "Fantasy"],
];

const SectionError = ({ title, onRetry }) => (
  <section className="mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 sm:mx-6 lg:mx-24">
    <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
    <p role="status" className="mt-2 text-sm text-[var(--color-text-muted)]">These movies couldn?t load. You can keep browsing or try again.</p>
    <button type="button" onClick={onRetry} aria-label={`Retry ${title}`}
      className="mt-4 min-h-11 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500">
      Try again
    </button>
  </section>
);

const HomePage = () => {
  const { sections, retrySection } = useHomeMovies();
  const trending = sections.trending;

  return (
    <main id="home" className="min-h-screen bg-slate-950">
      {trending.loading ? (
        <div aria-busy="true" aria-label="Loading featured movies"><HeroSkeleton /></div>
      ) : trending.error ? (
        <div className="pb-6 pt-28 sm:pt-40">
          <SectionError title="Featured movies" onRetry={() => retrySection("trending")} />
        </div>
      ) : trending.movies.length ? (
        <HeroSection trendingMovies={trending.movies} />
      ) : (
        <div className="px-4 pb-6 pt-28 text-[var(--color-text-muted)] sm:px-6 sm:pt-40">No featured movies are available right now. Explore the collections below.</div>
      )}

      <div className="relative z-30 mt-8 space-y-10 pb-14 sm:mt-16 sm:space-y-14 sm:pb-20">
        {ROWS.map(([key, title]) => {
          const section = sections[key];
          if (section.loading) return (
            <div key={key} aria-busy="true" aria-label={`Loading ${title}`}><MovieSliderSkeleton /></div>
          );
          if (section.error) return <SectionError key={key} title={title} onRetry={() => retrySection(key)} />;
          if (!section.movies.length) return null;
          return <MovieSlider key={key} title={title} movies={section.movies} />;
        })}
      </div>
    </main>
  );
};

export default memo(HomePage);
