import React from "react";
import {
  BookmarkIcon as BookmarkSolidIcon,
  ClockIcon,
  HeartIcon,
  PlayIcon,
  StarIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  BookmarkIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";

const MovieInfo = ({
  movie,
  isFav,
  isWatchlisted,
  favoritePending = false,
  watchlistPending = false,
  onPlay,
  playLabel = "Play Movie",
  playDisabled = false,
  onTrailer,
  onFavorite,
  onWatchlist,
}) => {
  return (
    <div className="animate-in flex flex-col gap-8 duration-700 slide-in-from-left-6 sm:gap-12 lg:flex-row lg:gap-8 xl:gap-12">
      <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0 lg:w-72 lg:max-w-none xl:w-80">
        <img
          src={movie.posterImage || movie.image}
          alt={movie.title}
          className="w-full rounded-2xl border border-[var(--color-border)] shadow-2xl transition-transform duration-500 hover:scale-[1.01] sm:rounded-4xl"
          loading="eager"
          decoding="async"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-black leading-[0.9] tracking-tighter text-[var(--color-hero-text)] sm:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-1 font-black text-black shadow-lg">
              <StarIcon className="h-4 w-4" />
              <span>{movie.rating}</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-hero-border)] bg-[var(--color-hero-surface)] px-3 py-1 text-xs font-bold text-[var(--color-hero-muted)] backdrop-blur-md sm:text-sm">
              <CalendarIcon className="h-4 w-4 text-purple-600" />
              <span>{movie.subtitle}</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-hero-border)] bg-[var(--color-hero-surface)] px-3 py-1 text-xs font-bold text-[var(--color-hero-muted)] backdrop-blur-md sm:text-sm">
              <ClockIcon className="h-4 w-4 text-purple-600" />
              <span>{movie.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-[var(--color-hero-border)] bg-[var(--color-hero-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-hero-muted)] backdrop-blur-md sm:text-sm"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[var(--color-hero-muted)]">
            Storyline
          </h3>
          <p className="max-w-4xl text-base font-medium leading-relaxed text-[var(--color-hero-text)] sm:text-lg">
            {movie.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-4">
          <button
            onClick={onPlay}
            disabled={playDisabled}
            className="group flex min-h-14 items-center justify-center gap-4 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95 sm:px-10 sm:py-5"
          >
            <PlayIcon className="h-5 w-5 transition-transform group-hover:scale-125" />
            {playLabel}
          </button>

          <div className="flex flex-wrap gap-3 sm:gap-6">
            {movie.trailerKey && (
              <button
                onClick={onTrailer}
                className="flex min-h-14 min-w-35 flex-1 items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-6 py-4 text-sm font-semibold text-[var(--color-text)] transition-all backdrop-blur-md hover:bg-[var(--color-surface-2)] active:scale-95 sm:px-8 sm:py-5"
              >
                Watch Trailer
              </button>
            )}

            <button
              aria-label={
                favoritePending
                  ? isFav
                    ? "Removing from favorites"
                    : "Adding to favorites"
                  : isFav
                    ? "Remove from favorites"
                    : "Add to favorites"
              }
              aria-busy={favoritePending}
              disabled={favoritePending}
              onClick={onFavorite}
              className={`flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 transition-all active:scale-95 disabled:cursor-wait disabled:opacity-70 sm:min-h-0 sm:flex-none sm:px-8 sm:py-5 ${
                isFav
                  ? "border-red-500 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20"
                  : "border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {favoritePending ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : isFav ? (
                <HeartIcon className="h-5 w-5" />
              ) : (
                <HeartOutline className="h-5 w-5" />
              )}
              <span className="text-xs font-semibold">
                {favoritePending
                  ? isFav
                    ? "Removing..."
                    : "Saving..."
                  : isFav
                    ? "Favorited"
                    : "Favorite"}
              </span>
            </button>

            <button
              aria-label={
                watchlistPending
                  ? isWatchlisted
                    ? "Removing from watchlist"
                    : "Adding to watchlist"
                  : isWatchlisted
                    ? "Remove from watchlist"
                    : "Add to watchlist"
              }
              aria-busy={watchlistPending}
              disabled={watchlistPending}
              onClick={onWatchlist}
              className={`flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 transition-all active:scale-95 disabled:cursor-wait disabled:opacity-70 sm:min-h-0 sm:flex-none sm:px-8 sm:py-5 ${
                isWatchlisted
                  ? "border-amber-400 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/20"
                  : "border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {watchlistPending ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : isWatchlisted ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
              <span className="text-xs font-semibold">
                {watchlistPending
                  ? isWatchlisted
                    ? "Removing..."
                    : "Saving..."
                  : isWatchlisted
                    ? "Watchlisted"
                    : "Watchlist"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
