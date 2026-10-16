import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import {
  BookmarkIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import { useWatchlist } from "../../context/WatchlistContext";

const MovieCard = ({ movie, headingLevel = "h2" }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const isFav = isFavorite(movie.id);
  const isSaved = isInWatchlist(movie.id);
  const TitleTag = headingLevel;

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

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-card group relative block aspect-[2/3] w-full shrink-0 cursor-pointer touch-manipulation transition-all duration-500 hover:z-50 hover:scale-[1.02]"
    >
      <img
        src={movie.posterImage || movie.image}
        alt={movie.title}
        className="h-full w-full rounded-2xl border border-white/10 object-cover shadow-2xl transition-all duration-500 group-hover:border-purple-500/50 group-hover:shadow-purple-500/30"
        loading="lazy"
        decoding="async"
      />

      <div className="absolute right-2 top-2 z-50 flex gap-1 sm:right-3 sm:top-3 sm:gap-2">
        <button
          onClick={handleWatchlistClick}
          className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-all duration-300 active:scale-90 sm:p-2.5 ${
            isSaved
              ? "border-amber-400 bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.45)]"
              : "border-white/10 bg-black/20 text-white opacity-100 hover:bg-white hover:text-black sm:opacity-0 sm:group-hover:opacity-100"
          }`}
          aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isSaved ? (
            <BookmarkSolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>

        <button
          onClick={handleFavoriteClick}
          className={`movie-card-action grid min-h-11 min-w-11 place-items-center rounded-xl border p-2 backdrop-blur-md transition-all duration-300 active:scale-90 sm:p-2.5 ${
            isFav
              ? "border-red-400 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : "border-white/10 bg-black/20 text-white opacity-100 hover:bg-white hover:text-black sm:opacity-0 sm:group-hover:opacity-100"
          }`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? (
            <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <HeartOutline className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
      </div>

      <div className="movie-card-overlay absolute inset-0 flex flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-t from-black via-black/80 to-transparent p-3 opacity-100 transition-all duration-500 sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 transition-all duration-500 delay-100 sm:block sm:group-hover:scale-100 sm:group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-0.5 h-7 w-7 text-white"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="movie-card-copy relative z-10 space-y-2 transition-transform duration-500 sm:translate-y-4 sm:group-hover:translate-y-0">
          <TitleTag className="line-clamp-2 text-sm font-black leading-tight text-white transition-transform duration-500 ease-out min-[420px]:text-base sm:text-lg sm:translate-y-4 sm:group-hover:translate-y-0 xl:text-xl">
            {movie.title}
          </TitleTag>

          <div className="flex flex-wrap items-center gap-2 transition-transform duration-500 delay-75 ease-out sm:translate-y-4 sm:group-hover:translate-y-0">
            <span className="flex items-center gap-1 rounded-md bg-yellow-500 px-1.5 py-0.5 text-[10px] font-black text-black shadow-md">
              <StarIcon className="h-3 w-3" />
              {movie.rating}
            </span>
            <span className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
              {movie.genres?.[0] || "Movie"}
            </span>
            <span className="w-full truncate text-[10px] font-bold text-gray-300 min-[420px]:w-auto sm:ml-auto">
              {movie.subtitle}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(MovieCard);
