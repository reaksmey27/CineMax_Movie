import { useCallback, useEffect, useState } from "react";
import {
  normalizeSearchQuery,
  readSearchHistory,
  writeSearchHistory,
  updateSearchHistory,
} from "../searchHistory";

// ─── useSearchHistory: persisted recent-search list ───────────────────────────

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState(() => readSearchHistory());

  useEffect(() => writeSearchHistory(searchHistory), [searchHistory]);

  const saveSearchQuery = useCallback((query) => {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) return;

    setSearchHistory((current) =>
      updateSearchHistory(current, normalizedQuery),
    );
  }, []);

  const deleteSearchHistoryItem = useCallback((queryToRemove) => {
    setSearchHistory((current) =>
      current.filter(
        (item) => item.toLowerCase() !== queryToRemove.toLowerCase(),
      ),
    );
  }, []);

  const clearSearchHistory = useCallback(() => setSearchHistory([]), []);

  return {
    searchHistory,
    saveSearchQuery,
    deleteSearchHistoryItem,
    clearSearchHistory,
  };
};
