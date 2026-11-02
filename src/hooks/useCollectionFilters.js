import { useEffect, useState } from "react";
import { HISTORY_DATE_RANGES } from "../pages/history/utils/historyDateFilter";

const OPTIONS = {
  favorites: { sorts: ["saved", "title", "rating"], statuses: ["all"] },
  watchlist: {
    sorts: ["saved", "title", "rating"],
    statuses: ["all", "unwatched", "watched"],
  },
  history: {
    sorts: ["recent", "oldest", "title"],
    statuses: ["all", "unfinished", "watched"],
  },
};

export default function useCollectionFilters(collection) {
  const options = OPTIONS[collection];
  const key = `cinemax:collection-filters:v1:${collection}`;
  const defaults = {
    query: "",
    status: "all",
    sort: options.sorts[0],
    dateRange: "all",
  };
  const [filters, setFilters] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return {
        dateRange:
          collection === "history" &&
          HISTORY_DATE_RANGES.includes(saved?.dateRange)
            ? saved.dateRange
            : "all",
        query: typeof saved?.query === "string" ? saved.query : "",
        status: options.statuses.includes(saved?.status) ? saved.status : "all",
        sort: options.sorts.includes(saved?.sort)
          ? saved.sort
          : options.sorts[0],
      };
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(filters));
    } catch {
      // Filtering still works when storage is blocked or full.
    }
  }, [key, filters]);

  return {
    ...filters,
    setQuery: (query) => setFilters((current) => ({ ...current, query })),
    setStatus: (status) => setFilters((current) => ({ ...current, status })),
    setSort: (sort) => setFilters((current) => ({ ...current, sort })),
    setDateRange: (dateRange) =>
      setFilters((current) => ({ ...current, dateRange })),
    reset: () => setFilters(defaults),
  };
}
