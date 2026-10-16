import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import {
  FilmIcon,
  BookmarkIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import { useWatchlist } from "../../context/WatchlistContext";

const MovieCard = ({
  movie,
  headingLevel = "h2",
  showActions = true,
  hideUnrated = false,
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isFav = isFavorite(movie.id);
  const isSaved = isInWatchlist(movie.id);
  const TitleTag = headingLevel;
  const poster = movie.posterImage || movie.image;
  const [failedPoster, setFailedPoster] = useState(null);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const year =
    movie.subtitle || movie.release_date?.slice(0, 4) || "Year unavailable";
  const rating = Number(movie.rating);

  return (
    <article className="movie-card group w-full min-w-0">
      <div className="relative aspect-[2/3]">
        <Link
          to={`/movie/${movie.id}`}
          aria-label={`View ${movie.title}`}
          className="block h-full overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg transition-shadow hover:shadow-purple-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
        >
          {poster && failedPoster !== poster ? (
            <img
              onError={() => setFailedPoster(poster)}
              src={poster}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
              <FilmIcon className="h-10 w-10" aria-hidden="true" />
              <span className="text-xs">Poster unavailable</span>
            </div>
          )}
        </Link>
        {showActions && (
          <div className="absolute right-2 top-2 z-50 flex gap-1 sm:right-3 sm:top-3 sm:gap-2">
            <button
              type="button"
              onClick={handleWatchlistClick}
              className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-all duration-300 active:scale-90 sm:p-2.5 ${
                isSaved
                  ? "border-amber-400 bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.45)]"
                  : "border-white/10 bg-black/70 text-white opacity-100 hover:bg-white hover:text-black sm:opacity-0 sm:group-hover:opacity-100"
              }`}
              aria-pressed={isSaved}
              aria-label={
                isSaved ? "Remove from watchlist" : "Add to watchlist"
              }
            >
              {isSaved ? (
                <BookmarkSolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-all duration-300 active:scale-90 sm:p-2.5 ${
                isFav
                  ? "border-red-400 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "border-white/10 bg-black/70 text-white opacity-100 hover:bg-white hover:text-black sm:opacity-0 sm:group-hover:opacity-100"
              }`}
              aria-pressed={isFav}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              {isFav ? (
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <HeartOutline className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 px-0.5 pt-3">
        <TitleTag className="min-h-10 text-sm font-semibold leading-5 text-[var(--color-text)] sm:min-h-12 sm:text-base sm:leading-6">
          <Link
            to={`/movie/${movie.id}`}
            title={movie.title}
            className="line-clamp-2 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
          >
            {movie.title}
          </Link>
        </TitleTag>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
          <span>{year}</span>
          {(!hideUnrated || (Number.isFinite(rating) && rating > 0)) && (
            <span
              className="inline-flex items-center gap-1 font-semibold text-[var(--color-text)]"
              aria-label={
                Number.isFinite(rating) && rating > 0
                  ? `Rated ${rating.toFixed(1)} out of 10`
                  : "Not yet rated"
              }
            >
              <StarIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {Number.isFinite(rating) && rating > 0
                ? rating.toFixed(1)
                : "Not rated"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default memo(MovieCard);
