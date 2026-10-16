import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { tmdbService } from "../../../services/tmdbService";
import MoviesFilters from "./MoviesFilters";
import MoviesSearchBar from "./MoviesSearchBar";

const SEARCH_DEBOUNCE = 250;
const LIVE_SEARCH_DEBOUNCE = 300;
const YEAR_DEBOUNCE = 250;
const SEARCH_HISTORY_KEY = "cinemax-search-history";
const SEARCH_HISTORY_LIMIT = 8;

const getHeadingState = (hasSearchQuery, hasActiveFilters) => {
  if (hasSearchQuery)
    return { top: "Searching", accent: "Results", suffix: "" };
  if (hasActiveFilters)
    return { top: "Filtered", accent: "Selection", suffix: "" };
  return { top: "Explore", accent: "Cinematic", suffix: " World" };
};

const getSubtitle = (
  hasSearchQuery,
  hasActiveFilters,
  searchQuery,
  page,
  totalPages,
) => {
  if (hasSearchQuery)
    return `Searching for "${searchQuery}" movies. Page ${page} of ${totalPages}.`;
  if (hasActiveFilters)
    return `Discover results tailored to your filters. Page ${page} of ${totalPages}.`;
  return "Browse through thousands of movies by your favorite genres. Live updates from the global community.";
};

const normalizeSearchQuery = (query) => query.trim();

const readSearchHistory = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, SEARCH_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

const writeSearchHistory = (history) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

const updateSearchHistory = (history, query) => {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return history;

  const deduped = history.filter(
    (item) => item.toLowerCase() !== normalizedQuery.toLowerCase(),
  );
  return [normalizedQuery, ...deduped].slice(0, SEARCH_HISTORY_LIMIT);
};

const MoviesHeader = ({
  collectionTitle,
  searchQuery,
  page,
  totalPages,
  genres,
  selectedGenre,
  releaseYear,
  minRating,
  sortBy,
  hasActiveFilters,
  onSearch,
  onClear,
  onGenreChange,
  onYearChange,
  onRatingChange,
  onSortChange,
  onClearFilters,
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [yearInput, setYearInput] = useState(releaseYear);
  const [openSelect, setOpenSelect] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() => readSearchHistory());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasTypedSinceFocus, setHasTypedSinceFocus] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isLiveSearchLoading, setIsLiveSearchLoading] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);

  const searchRef = useRef(null);
  const skipNextDebounceRef = useRef(false);

  const hasSearchQuery = Boolean(searchQuery.trim());
  const heading = collectionTitle && !hasSearchQuery
    ? { top: collectionTitle, accent: "Movies", suffix: "" }
    : getHeadingState(hasSearchQuery, hasActiveFilters);
  const subtitle = collectionTitle && !hasSearchQuery
    ? `Browse ${collectionTitle.toLowerCase()} movies. Select a filter to explore other movies.`
    : getSubtitle(
    hasSearchQuery,
    hasActiveFilters,
    searchQuery,
    page,
    totalPages,
  );
  const trimmedInput = inputValue.trim();
  const isTyping = inputValue !== searchQuery;
  const shouldShowLiveDropdown = isSearchFocused && trimmedInput.length >= 2;
  const shouldShowHistoryDropdown =
    isSearchFocused &&
    !hasTypedSinceFocus &&
    !isTyping &&
    trimmedInput.length < 2;

  const toggleSelect = (key) =>
    setOpenSelect((current) => (current === key ? null : key));

  const saveSearchQuery = useCallback((query) => {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) return;

    setSearchHistory((current) =>
      updateSearchHistory(current, normalizedQuery),
    );
  }, []);

  const runSearch = useCallback(
    (query, { persistHistory = false } = {}) => {
      if (persistHistory) saveSearchQuery(query);
      onSearch(query);
    },
    [onSearch, saveSearchQuery],
  );

  const handleSearchSelection = (query) => {
    skipNextDebounceRef.current = true;
    setHasTypedSinceFocus(false);
    setInputValue(query);
    setIsSearchFocused(false);
    runSearch(query, { persistHistory: true });
  };

  const handleResultSelect = useCallback(
    (movie) => {
      setIsSearchFocused(false);
      setActiveResultIndex(-1);
      navigate(`/movie/${movie.id}`);
    },
    [navigate],
  );

  const handleDeleteHistoryItem = (queryToRemove) => {
    setSearchHistory((current) =>
      current.filter(
        (item) => item.toLowerCase() !== queryToRemove.toLowerCase(),
      ),
    );
  };

  useEffect(() => setInputValue(searchQuery), [searchQuery]);
  useEffect(() => setYearInput(releaseYear), [releaseYear]);
  useEffect(() => setOpenSelect(null), [minRating, sortBy]);
  useEffect(() => writeSearchHistory(searchHistory), [searchHistory]);

  useEffect(() => {
    if (!isSearchFocused) return undefined;

    const handlePointerDown = (e) => {
      if (!searchRef.current?.contains(e.target)) {
        setHasTypedSinceFocus(false);
        setIsSearchFocused(false);
        setActiveResultIndex(-1);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setHasTypedSinceFocus(false);
        setIsSearchFocused(false);
        setActiveResultIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchFocused]);

  useEffect(() => {
    if (!isSearchFocused || trimmedInput.length < 2) {
      setLiveResults([]);
      setIsLiveSearchLoading(false);
      setActiveResultIndex(-1);
      return undefined;
    }

    let isActive = true;
    setIsLiveSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await tmdbService.searchMovies(trimmedInput, 1);
        if (!isActive) return;

        const results = (response?.results || []).slice(0, 6);
        setLiveResults(results);
        setActiveResultIndex(results.length > 0 ? 0 : -1);
      } catch (error) {
        if (!isActive) return;
        console.error("Error fetching live search results:", error);
        setLiveResults([]);
        setActiveResultIndex(-1);
      } finally {
        if (isActive) setIsLiveSearchLoading(false);
      }
    }, LIVE_SEARCH_DEBOUNCE);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [isSearchFocused, trimmedInput]);

  useEffect(() => {
    if (inputValue === searchQuery) return undefined;
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return undefined;
    }

    const id = window.setTimeout(
      () => runSearch(inputValue, { persistHistory: true }),
      SEARCH_DEBOUNCE,
    );
    return () => window.clearTimeout(id);
  }, [inputValue, runSearch, searchQuery]);

  useEffect(() => {
    if (yearInput === releaseYear || (yearInput !== "" && yearInput.length < 4))
      return undefined;
    const id = window.setTimeout(() => onYearChange(yearInput), YEAR_DEBOUNCE);
    return () => window.clearTimeout(id);
  }, [onYearChange, releaseYear, yearInput]);

  return (
    <div className="mb-10 flex flex-col gap-6 sm:mb-16 sm:gap-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl md:text-5xl">
            {heading.top} <br />
            <span className="text-purple-500">{heading.accent}</span>
            {heading.suffix}
          </h1>
          <p className="max-w-md text-sm font-medium text-gray-400">
            {subtitle}
          </p>
        </div>

        <MoviesSearchBar
          activeResultIndex={activeResultIndex}
          inputValue={inputValue}
          isLiveSearchLoading={isLiveSearchLoading}
          liveResults={liveResults}
          onClear={() => {
            skipNextDebounceRef.current = true;
            setHasTypedSinceFocus(true);
            setInputValue("");
            onClear();
          }}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onHistoryClearAll={() => setSearchHistory([])}
          onHistorySelect={handleSearchSelection}
          onInputBlur={() => {
            window.setTimeout(() => {
              if (!searchRef.current?.contains(document.activeElement)) {
                setHasTypedSinceFocus(false);
                setIsSearchFocused(false);
                setActiveResultIndex(-1);
              }
            }, 0);
          }}
          onInputChange={(e) => {
            setHasTypedSinceFocus(true);
            setInputValue(e.target.value);
            setActiveResultIndex(-1);
          }}
          onInputFocus={() => {
            setHasTypedSinceFocus(false);
            setIsSearchFocused(true);
          }}
          onInputKeyDown={(e) => {
            if (shouldShowLiveDropdown && liveResults.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveResultIndex(
                  (current) => (current + 1) % liveResults.length,
                );
                return;
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveResultIndex((current) =>
                  current <= 0 ? liveResults.length - 1 : current - 1,
                );
                return;
              }

              if (
                e.key === "Enter" &&
                activeResultIndex >= 0 &&
                liveResults[activeResultIndex]
              ) {
                e.preventDefault();
                handleResultSelect(liveResults[activeResultIndex]);
                return;
              }
            }

            if (e.key === "Escape") {
              setHasTypedSinceFocus(false);
              setIsSearchFocused(false);
              setActiveResultIndex(-1);
              e.currentTarget.blur();
            }
          }}
          onResultHover={setActiveResultIndex}
          onResultSelect={handleResultSelect}
          searchHistory={searchHistory}
          searchRef={searchRef}
          shouldShowHistoryDropdown={shouldShowHistoryDropdown}
          shouldShowLiveDropdown={shouldShowLiveDropdown}
          setHasTypedSinceFocus={setHasTypedSinceFocus}
        />
      </div>

      <MoviesFilters
        genres={genres}
        hasActiveFilters={hasActiveFilters}
        hasSearchQuery={hasSearchQuery}
        minRating={minRating}
        onClearFilters={onClearFilters}
        onGenreChange={onGenreChange}
        onRatingChange={onRatingChange}
        onSortChange={onSortChange}
        openSelect={openSelect}
        selectedGenre={selectedGenre}
        sortBy={sortBy}
        toggleSelect={toggleSelect}
        yearInput={yearInput}
        setYearInput={setYearInput}
      />
    </div>
  );
};

export default memo(MoviesHeader);
