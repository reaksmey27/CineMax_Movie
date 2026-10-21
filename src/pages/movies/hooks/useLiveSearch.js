import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";

// ─── Constants: debounce timing ───────────────────────────────────────────────

const LIVE_SEARCH_DEBOUNCE = 300;

// ─── useLiveSearch: debounced TMDB search for the dropdown ────────────────────

export const useLiveSearch = ({ enabled, query }) => {
  const [liveResults, setLiveResults] = useState([]);
  const [isLiveSearchLoading, setIsLiveSearchLoading] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);

  useEffect(() => {
    if (!enabled || query.length < 2) {
      setLiveResults([]);
      setIsLiveSearchLoading(false);
      setActiveResultIndex(-1);
      return undefined;
    }

    let isActive = true;
    setIsLiveSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await tmdbService.searchMovies(query, 1);
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
  }, [enabled, query]);

  return {
    liveResults,
    isLiveSearchLoading,
    activeResultIndex,
    setActiveResultIndex,
  };
};
