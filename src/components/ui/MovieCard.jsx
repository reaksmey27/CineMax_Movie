import MoviePoster from "./MoviePoster";
import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  BookmarkIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import { useLanguage } from "../../context/LanguageContext";
import { useWatchlist } from "../../context/WatchlistContext";

// ─── MovieCard: poster card with quick actions ────────────────────────────────

const MovieCard = ({
  movie,
  headingLevel = "h2",
  showActions = true,
  hideUnrated = false,
  showReleaseDate = false,
}) => {
  const { t, language } = useLanguage();
  const { toggleFavorite, isFavorite, isSavingFavorite } = useFavorites();
  const { toggleWatchlist, isInWatchlist, isSavingToWatchlist } =
    useWatchlist();
  const isFav = isFavorite(movie.id);
  const isSaved = isInWatchlist(movie.id);
  const favoritePending = isSavingFavorite(movie.id);
  const watchlistPending = isSavingToWatchlist(movie.id);
  const TitleTag = headingLevel;
  const poster = movie.posterImage || movie.image;

  // ─── Handlers: favorite & watchlist toggles ───────────────────────────────────

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
    movie.subtitle || movie.release_date?.slice(0, 4) || t("Year unavailable");
  const rating = Number(movie.rating);

  // ─── Render: poster, action buttons & rating ──────────────────────────────────

  return (
    <article className="movie-card group flex w-full min-w-0 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] transition-colors hover:border-purple-500/40">
      <div className="relative aspect-[2/3] shrink-0">
        <Link
          to={`/movie/${movie.id}`}
          aria-label={t("View {title}", { title: movie.title })}
          className="block h-full overflow-hidden rounded-t-2xl bg-[var(--color-bg-elevated)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
        >
          <MoviePoster src={poster} />
        </Link>
        {showActions && (
          <div className="absolute right-2 top-2 z-10 flex gap-1.5">
            <button
              type="button"
              disabled={watchlistPending}
              onClick={handleWatchlistClick}
              title={
                isSaved ? t("Remove from watchlist") : t("Add to watchlist")
              }
              className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isSaved
                  ? "border-amber-300 bg-amber-400 text-slate-950"
                  : "border-white/20 bg-slate-950/85 text-white hover:border-purple-400 hover:bg-purple-700"
              }`}
              aria-pressed={isSaved}
              aria-busy={watchlistPending}
              aria-label={
                watchlistPending
                  ? isSaved
                    ? t("Removing from watchlist")
                    : t("Adding to watchlist")
                  : isSaved
                    ? t("Remove from watchlist")
                    : t("Add to watchlist")
              }
            >
              {watchlistPending ? (
                <ArrowPathIcon
                  className="h-4 w-4 animate-spin sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              ) : isSaved ? (
                <BookmarkSolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            <button
              type="button"
              disabled={favoritePending}
              onClick={handleFavoriteClick}
              title={isFav ? t("Remove from favorites") : t("Add to favorites")}
              className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isFav
                  ? "border-rose-300 bg-rose-600 text-white"
                  : "border-white/20 bg-slate-950/85 text-white hover:border-purple-400 hover:bg-purple-700"
              }`}
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
            >
              {favoritePending ? (
                <ArrowPathIcon
                  className="h-4 w-4 animate-spin sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              ) : isFav ? (
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <HeartOutline className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3">
        <TitleTag className="min-h-10 text-sm font-semibold leading-5 text-[var(--color-text)] sm:min-h-12 sm:text-base sm:leading-6">
          <Link
            to={`/movie/${movie.id}`}
            title={movie.title}
            className="line-clamp-2 rounded-sm [overflow-wrap:anywhere] hover:text-purple-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
          >
            {movie.title}
          </Link>
        </TitleTag>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
          {showReleaseDate && movie.release_date ? (
            <time dateTime={movie.release_date}>
              {new Intl.DateTimeFormat(language, {
                dateStyle: "medium",
              }).format(new Date(`${movie.release_date}T00:00:00`))}
            </time>
          ) : (
            <span>{year}</span>
          )}
          {(!hideUnrated || (Number.isFinite(rating) && rating > 0)) && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-1 text-xs font-semibold tabular-nums text-[var(--color-text)]"
              aria-label={
                Number.isFinite(rating) && rating > 0
                  ? t("Rated {rating} out of 10", {
                      rating: rating.toFixed(1),
                    })
                  : t("Not yet rated")
              }
            >
              <StarIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {Number.isFinite(rating) && rating > 0
                ? rating.toFixed(1)
                : t("Not rated")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default memo(MovieCard);
