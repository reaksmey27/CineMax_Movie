// ─── Constants: search history storage ────────────────────────────────────────

export const SEARCH_HISTORY_KEY = "cinemax-search-history";
export const SEARCH_HISTORY_LIMIT = 8;

// ─── Helpers: normalize, read, write & update search history ──────────────────

export const normalizeSearchQuery = (query) => query.trim();

export const readSearchHistory = () => {
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

export const writeSearchHistory = (history) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

export const updateSearchHistory = (history, query) => {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return history;

  const deduped = history.filter(
    (item) => item.toLowerCase() !== normalizedQuery.toLowerCase(),
  );
  return [normalizedQuery, ...deduped].slice(0, SEARCH_HISTORY_LIMIT);
};
