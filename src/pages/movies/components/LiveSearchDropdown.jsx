import { useEffect, useRef } from "react";
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
  onViewAll,
  listId = "movie-live-search-results",
}) => {
  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);
  const visibleResults = results.slice(0, LIVE_SEARCH_LIMIT);
  const hasResults = visibleResults.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 origin-top animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-4 py-3">
          <p className="text-xs font-semibold text-[var(--color-text-soft)]">
            Movie suggestions
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            {isLoading ? "Searching?" : `${visibleResults.length} matches`}
          </span>
        </div>

        {isLoading ? (
          <div role="status" className="flex items-center gap-3 px-4 py-6 text-sm text-[var(--color-text-muted)]">
            <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-400" />
            Searching movies...
          </div>
        ) : hasResults ? (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={`Search results for ${query}`}
            className="max-h-[min(23rem,calc(100dvh-16rem))] overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin] [scrollbar-color:var(--color-text-subtle)_transparent]"
          >
            {visibleResults.map((movie, index) => {
              const isActive = index === activeIndex;
              const posterUrl = getPosterUrl(movie);
              const year = getMovieYear(movie);

              return (
                <li key={movie.id} role="presentation">
                  <button
                    id={listId === "movie-live-search-results" ? `movie-live-result-${movie.id}` : `${listId}-${movie.id}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => onHoverIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(movie)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:-outline-offset-2 ${
                      isActive
                        ? "bg-[var(--color-surface-3)] text-[var(--color-text)] shadow-[inset_3px_0_0_#a855f7]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                    }`}
                  >
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--color-border-soft)] bg-[var(--color-surface-1)]">
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
                      <div>
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--color-text)]">
                          {movie.title}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <span>{year || "Year unavailable"}</span>
                        <span aria-hidden="true">?</span>
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
          <div className="flex flex-col items-center gap-3 px-6 py-7 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <FilmIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                No results found for &quot;{query}&quot;
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Try a different title or a shorter keyword.
              </p>
            </div>
          </div>
        )}
        {onViewAll && (
          <div className="border-t border-[var(--color-border-soft)] p-2">
            <button type="button" onClick={onViewAll}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500">
              <span>View all results</span><span aria-hidden="true">?</span>
            </button>
            <p className="px-3 pb-1 text-xs text-[var(--color-text-muted)]">? ? to browse ? Enter to select ? Esc to close</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearchDropdown;
