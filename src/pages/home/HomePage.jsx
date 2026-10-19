import { memo, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import HeroSkeleton from "./components/HeroSkeleton";
import MovieSlider from "./components/MovieSlider";
import MovieSliderSkeleton from "../../components/ui/MovieSliderSkeleton";
import { useLanguage } from "../../context/LanguageContext";
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

const DISCOVERY_GUIDE = [
  {
    title: "Start with a collection",
    description:
      "Start with the featured carousel for a quick look at movies people are talking about, then browse popular titles, top-rated favorites, and films currently in theaters. Each collection gives you a different starting point, so you can move from a widely loved pick to a new release without having to know exactly what you want first.",
    link: "/trending",
    linkLabel: "Explore trending movies",
  },
  {
    title: "Find a movie for your mood",
    description:
      "Use genre rows to match your mood, or open the movies page to narrow results with release year, minimum rating, and sort order. Search by title when you already have a film in mind. Filters are designed to work together, making it easier to scan a broad catalog and find something that fits the time you have.",
    link: "/movies",
    linkLabel: "Browse and filter movies",
  },
  {
    title: "Look ahead and compare",
    description:
      "Check upcoming releases to see what is on the way, and explore trending titles when you want ideas from current viewing conversations. Open a movie to read its overview, see key details, and check for an available trailer. Ratings, release dates, and genres help you compare options before choosing what to explore next.",
    link: "/upcoming",
    linkLabel: "See upcoming releases",
  },
  {
    title: "Keep your discoveries",
    description:
      "Save films you want to revisit to Favorites, or add possibilities to your Watchlist for later. Sign in to keep your collections connected to your account, so your selections are available when you return. Use these lists to keep track of films you enjoyed, films you are curious about, and recommendations you do not want to forget.",
    link: "/watchlist",
    linkLabel: "Open your watchlist",
  },
];

const SectionError = ({ title, onRetry }) => {
  const { t } = useLanguage();

  return (
    <section className="mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 sm:mx-6 lg:mx-24">
      <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
      <p role="status" className="mt-2 text-sm text-[var(--color-text-muted)]">
        {t("These movies could not load. You can keep browsing or try again.")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        aria-label={t("Retry {title}", { title })}
        className="mt-4 min-h-11 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
      >
        {t("Try again")}
      </button>
    </section>
  );
};

const HomePage = () => {
  const { t } = useLanguage();
  const { sections, retrySection } = useHomeMovies();
  const trending = sections.trending;
  const [showAllGenres, setShowAllGenres] = useState(false);

  return (
    <main id="home" className="min-h-screen bg-slate-950">
      <h1 className="sr-only">
        {t("CineMax - discover movies, trailers, and your next favorite")}
      </h1>
      {trending.loading ? (
        <div
          aria-busy="true"
          aria-label={t("Loading {title}", { title: t("Featured movies") })}
        >
          <HeroSkeleton />
        </div>
      ) : trending.error ? (
        <div className="pb-6 pt-28 sm:pt-40">
          <SectionError
            title={t("Featured movies")}
            onRetry={() => retrySection("trending")}
          />
        </div>
      ) : trending.movies.length ? (
        <HeroSection trendingMovies={trending.movies} />
      ) : (
        <div className="px-4 pb-6 pt-28 text-[var(--color-text-muted)] sm:px-6 sm:pt-40">
          {t(
            "No featured movies are available right now. Explore the collections below.",
          )}
        </div>
      )}

      <div className="relative z-30 mt-8 space-y-10 pb-14 sm:mt-16 sm:space-y-14 sm:pb-20">
        {(showAllGenres ? ROWS : ROWS.slice(0, 6)).map(
          ([key, title, viewAllTo]) => {
            const section = sections[key];
            if (section.loading)
              return (
                <div
                  key={key}
                  aria-busy="true"
                  aria-label={t("Loading {title}", { title: t(title) })}
                >
                  <MovieSliderSkeleton />
                </div>
              );
            if (section.error)
              return (
                <SectionError
                  key={key}
                  title={t(title)}
                  onRetry={() => retrySection(key)}
                />
              );
            if (!section.movies.length) return null;
            return (
              <MovieSlider
                key={key}
                title={t(title)}
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
            {showAllGenres ? t("Show fewer genres") : t("Explore more genres")}
          </button>
        </div>
      </div>

      <section
        aria-labelledby="home-discovery-guide"
        className="mx-auto max-w-350 px-4 pb-16 sm:px-6 sm:pb-24 lg:px-24 xl:px-40"
      >
        <div className="max-w-3xl">
          <h2
            id="home-discovery-guide"
            className="text-2xl font-black tracking-tight text-white sm:text-3xl"
          >
            {t("Discover movies your way")}
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-300">
            {t(
              "Finding a movie should be part of the fun. CineMax brings collections, genres, search, and personal lists together to help you move from browsing to a great pick. Whether you have a favorite actor in mind or just a little time to spare, start anywhere and follow your curiosity.",
            )}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {DISCOVERY_GUIDE.map(({ title, description, link, linkLabel }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
            >
              <h3 className="text-lg font-bold text-white">{t(title)}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {t(description)}
              </p>
              <Link
                to={link}
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-purple-300 underline-offset-4 hover:text-purple-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400"
              >
                {t(linkLabel)}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default memo(HomePage);
