import { ArrowPathIcon, FilmIcon, StarIcon } from "@heroicons/react/24/outline";

import { tmdbService } from "../../../services/tmdbService";

const LIVE_SEARCH_LIMIT = 6;

const getMovieYear = (movie) => {
  const releaseDate = movie?.release_date || "";
  if (!releaseDate) return "";

  const year = new Date(releaseDate).getFullYear();
  return Number.isNaN(year) ? "" : String(year);
};

const formatVoteAverage = (voteAverage) => {
  const numericRating = Number(voteAverage);
  return Number.isFinite(numericRating) ? numericRating.toFixed(1) : "0.0";
};

const getPosterUrl = (movie) =>
  tmdbService.getImageUrl(movie.poster_path, "w92") ||
  tmdbService.getImageUrl(movie.backdrop_path, "w92") ||
  "";

const LiveSearchDropdown = ({
  query,
  results,
  isLoading,
  activeIndex,
  onSelect,
  onHoverIndex,
  listId = "movie-live-search-results",
}) => {
  const visibleResults = results.slice(0, LIVE_SEARCH_LIMIT);
  const hasResults = visibleResults.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 origin-top animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#17181d]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-black/20 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-gray-500">
            Live results
          </p>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
            TMDB
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 px-5 py-6 text-sm font-medium text-gray-400">
            <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-400" />
            Searching movies...
          </div>
        ) : hasResults ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={`Search results for ${query}`}
            className="max-h-[24rem] overflow-y-auto py-2"
          >
            {visibleResults.map((movie, index) => {
              const isActive = index === activeIndex;
              const posterUrl = getPosterUrl(movie);
              const year = getMovieYear(movie);

              return (
                <li key={movie.id}>
                  <button
                    id={listId === "movie-live-search-results" ? `movie-live-result-${movie.id}` : `${listId}-${movie.id}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => onHoverIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(movie)}
                    className={`flex w-full items-center gap-4 px-5 py-3.5 text-left transition-all ${
                      isActive
                        ? "bg-purple-600/20 text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.25)]"
                        : "text-white/95 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <FilmIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-[15px] font-bold text-white">
                          {movie.title}
                        </p>
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                          {year || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
                          {formatVoteAverage(movie.vote_average)}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <FilmIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                No results found for &quot;{query}&quot;
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500">
                Try a different title or a shorter keyword.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearchDropdown;
