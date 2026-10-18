import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PlayCircleIcon,
  PlayIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";

import TrailerModal from "../../movies/components/TrailerModal";

import { useFavorites } from "../../../context/FavoritesContext";
import { useLanguage } from "../../../context/LanguageContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURED_COUNT = 4;
const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 600;
const DOT_DURATION = 400;

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavButton = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="p-3 sm:p-4 rounded-full bg-black/20 border border-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all active:scale-90"
  >
    {children}
  </button>
);

const HeroSection = ({ trendingMovies = [] }) => {
  const { t } = useLanguage();
  const featured = trendingMovies.slice(0, FEATURED_COUNT);
  const { toggleFavorite, isFavorite, isSavingFavorite } = useFavorites();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const transitionTimer = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  const stopRotation = () => {
    setPaused(true);
    window.clearTimeout(transitionTimer.current);
    setFade(true);
  };

  const transition = useCallback(
    (getNext, delay = FADE_DURATION) => {
      window.clearTimeout(transitionTimer.current);
      if (reducedMotion) {
        setCurrentIndex(getNext);
        setFade(true);
        return;
      }
      setFade(false);
      transitionTimer.current = window.setTimeout(() => {
        setCurrentIndex(getNext);
        setFade(true);
      }, delay);
    },
    [reducedMotion],
  );

  const handleNext = useCallback(() => {
    transition((prev) => (prev + 1) % featured.length);
  }, [featured.length, transition]);

  const handlePrev = useCallback(() => {
    transition((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  }, [featured.length, transition]);

  const goTo = useCallback(
    (idx) => {
      transition(() => idx, DOT_DURATION);
    },
    [transition],
  );

  useEffect(() => {
    if (featured.length < 2 || showTrailer || paused || reducedMotion) return;
    const id = setInterval(handleNext, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [featured.length, showTrailer, paused, reducedMotion, handleNext]);

  if (featured.length === 0) return null;

  const movie = featured[currentIndex % featured.length];
  const isFav = isFavorite(movie.id);
  const favoritePending = isSavingFavorite(movie.id);

  return (
    <section
      aria-label={t("Featured movies")}
      aria-roledescription="carousel"
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) stopRotation();
        else setPaused(false);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
      className="hero-carousel relative flex min-h-svh w-full items-end overflow-hidden bg-black pb-24 pt-28 sm:items-center sm:pb-28 sm:pt-36"
    >
      {/* ── Background ── */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${fade ? "opacity-60" : "opacity-0"}`}
      >
        <img
          src={movie.backdropImage || movie.image}
          alt=""
          className="w-full h-full object-cover sm:object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/20 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div
        className={`relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-10 transition-all duration-700 ease-out transform sm:px-6 sm:pb-0 lg:px-24 xl:px-40 ${fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
      >
        <h2 className="mb-4 text-4xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl sm:mb-6 sm:text-5xl lg:text-6xl">
          {movie.title} <br className="hidden sm:block" />
          <span className="mt-2 block text-base font-bold tracking-tight text-white/60 sm:mt-0 sm:inline sm:text-3xl lg:text-4xl">
            {movie.subtitle}
          </span>
        </h2>

        {/* Badges */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:mb-8 sm:gap-4">
          <span className="rounded-lg bg-purple-600 px-2 py-1 text-xs font-semibold text-white shadow-lg sm:text-sm">
            {t("Featured")}
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black sm:text-xs">
            <StarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{movie.rating}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-gray-300 backdrop-blur-md sm:text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-sm font-medium leading-relaxed text-gray-300 line-clamp-4 sm:mb-12 sm:text-lg sm:line-clamp-5 sm:text-gray-400 lg:text-xl">
          {movie.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            to={`/movie/${movie.id}`}
            className="group flex min-h-14 items-center justify-center gap-4 rounded-2xl bg-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95 sm:px-10 sm:py-5"
          >
            <PlayCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
            <span>{t("Watch now")}</span>
          </Link>

          <div className="flex w-full flex-wrap items-stretch gap-3 sm:w-auto sm:flex-nowrap sm:items-center sm:gap-4">
            {movie.trailerKey && (
              <button
                onClick={() => setShowTrailer(true)}
                className="group flex min-h-14 min-w-0 flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition-all backdrop-blur-xl hover:bg-white/10 active:scale-95 sm:flex-none sm:gap-4 sm:px-10 sm:py-5"
              >
                <div className="rounded-full bg-purple-600/20 p-1.5 sm:p-2">
                  <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 transition-transform group-hover:scale-125" />
                </div>
                <span>{t("Trailer")}</span>
              </button>
            )}

            <button
              aria-pressed={isFav}
              aria-busy={favoritePending}
              aria-label={
                favoritePending
                  ? isFav
                    ? t("Removing from favorites")
                    : t("Adding to favorites")
                  : isFav
                    ? t("Remove from favorites")
                    : t("Add to favorites")
              }
              disabled={favoritePending}
              onClick={() => toggleFavorite(movie)}
              className={`flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4 font-black transition-all backdrop-blur-xl active:scale-95 sm:flex-none sm:gap-4 sm:px-10 sm:py-5 ${
                isFav
                  ? "border-red-500 bg-red-500/20 text-red-500 shadow-lg shadow-red-500/20"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {favoritePending ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
              ) : isFav ? (
                <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <HeartOutline className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
              <span className="text-sm font-semibold">
                {favoritePending
                  ? isFav
                    ? t("Removing...")
                    : t("Saving...")
                  : t("Favorite")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Nav arrows ── */}
      <div className="absolute inset-y-0 left-0 hidden lg:flex items-center px-10 z-30">
        <NavButton label={t("Previous featured movie")} onClick={handlePrev}>
          <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8" />
        </NavButton>
      </div>
      <div className="absolute inset-y-0 right-0 hidden lg:flex items-center px-10 z-30">
        <NavButton label={t("Next featured movie")} onClick={handleNext}>
          <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8" />
        </NavButton>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-12 sm:gap-4">
        {featured.map((_, idx) => (
          <button
            key={idx}
            aria-label={t("Show featured movie {number}", {
              number: idx + 1,
            })}
            aria-pressed={idx === currentIndex}
            onClick={() => goTo(idx)}
            className={`hero-dot h-2 rounded-full transition-all duration-500 ${
              idx === currentIndex
                ? "w-10 sm:w-14 bg-purple-600 shadow-lg shadow-purple-500/50"
                : "w-3 bg-white/30 sm:w-3"
            }`}
          />
        ))}
      </div>

      {/* ── Trailer modal ── */}
      {showTrailer && movie.trailerKey && (
        <TrailerModal movie={movie} onClose={() => setShowTrailer(false)} />
      )}
    </section>
  );
};

export default memo(HeroSection);
