import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MoviesSearchBar from "./MoviesSearchBar";
import { useSearchHistory } from "../hooks/useSearchHistory";
import { useLiveSearch } from "../hooks/useLiveSearch";

const SEARCH_DEBOUNCE = 250;

export default function MoviesSearch({ searchQuery, onSearch, onClear }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasTypedSinceFocus, setHasTypedSinceFocus] = useState(false);

  const searchRef = useRef(null);
  const skipNextDebounceRef = useRef(false);

  // ─── Derived State: mirror URL-driven props into inputs ──────────────────────

  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setInputValue(searchQuery);
  }

  const {
    searchHistory,
    saveSearchQuery,
    deleteSearchHistoryItem,
    clearSearchHistory,
  } = useSearchHistory();

  const trimmedInput = inputValue.trim();

  const {
    liveResults,
    isLiveSearchLoading,
    activeResultIndex,
    setActiveResultIndex,
  } = useLiveSearch({ enabled: isSearchFocused, query: trimmedInput });

  const isTyping = inputValue !== searchQuery;
  const shouldShowLiveDropdown = isSearchFocused && trimmedInput.length >= 2;
  const shouldShowHistoryDropdown =
    isSearchFocused &&
    !hasTypedSinceFocus &&
    !isTyping &&
    trimmedInput.length < 2;

  // ─── Handlers: search, history & selects ─────────────────────────────────────

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
    [navigate, setActiveResultIndex],
  );

  // ─── Effects: debounce & dismissal ──────────────────────────────────────────

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
  }, [isSearchFocused, setActiveResultIndex]);

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

  return (
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
      onDeleteHistoryItem={deleteSearchHistoryItem}
      onHistoryClearAll={clearSearchHistory}
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
  );
}
