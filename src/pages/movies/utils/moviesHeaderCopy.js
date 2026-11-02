// ─── Helpers: heading & subtitle copy ─────────────────────────────────────────

export const getHeadingState = (hasSearchQuery, hasActiveFilters) => {
  if (hasSearchQuery)
    return { top: "Searching", accent: "Results", suffix: "" };
  if (hasActiveFilters)
    return { top: "Filtered", accent: "Selection", suffix: "" };
  return { top: "Explore", accent: "Cinematic", suffix: " World" };
};

export const getSubtitle = (
  t,
  hasSearchQuery,
  hasActiveFilters,
  searchQuery,
  page,
  totalPages,
) => {
  if (hasSearchQuery)
    return t('Searching for "{query}" movies. Page {page} of {totalPages}.', {
      query: searchQuery,
      page,
      totalPages,
    });
  if (hasActiveFilters)
    return t(
      "Discover results tailored to your filters. Page {page} of {totalPages}.",
      {
        page,
        totalPages,
      },
    );
  return t(
    "Browse through thousands of movies by your favorite genres. Live updates from the global community.",
  );
};
