import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";

// ─── Constants: debounce timing ───────────────────────────────────────────────

const LIVE_SEARCH_DEBOUNCE = 300;

// ─── useLiveSearch: debounced TMDB search for the dropdown ────────────────────

export const useLiveSearch = ({ enabled, query }) => {
  const [response, setResponse] = useState({ query: "", results: [] });
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const canSearch = enabled && query.length >= 2;
  const isLiveSearchLoading = canSearch && response.query !== query;
  const liveResults = canSearch && !isLiveSearchLoading ? response.results : [];

  useEffect(() => {
    if (!enabled || query.length < 2) {
      return undefined;
    }

    let isActive = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await tmdbService.searchMovies(query, 1);
        if (!isActive) return;

        const results = (response?.results || []).slice(0, 6);
        setResponse({ query, results });
        setActiveResultIndex(results.length > 0 ? 0 : -1);
      } catch (error) {
        if (!isActive) return;
        console.error("Error fetching live search results:", error);
        setResponse({ query, results: [] });
        setActiveResultIndex(-1);
      }
    }, LIVE_SEARCH_DEBOUNCE);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, query]);

  return {
    liveResults,
    isLiveSearchLoading,
    activeResultIndex: liveResults.length ? activeResultIndex : -1,
    setActiveResultIndex,
  };
};
