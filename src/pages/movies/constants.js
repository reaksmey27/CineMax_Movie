// ─── Constants: default sort for discover ─────────────────────────────────────

export const DEFAULT_DISCOVER_SORT = "popularity.desc";

// ─── Sort Options: how the movie list is ordered ──────────────────────────────

export const DISCOVER_SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "primary_release_date.desc", label: "Newest Release" },
  { value: "primary_release_date.asc", label: "Oldest Release" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "original_title.asc", label: "Title A-Z" },
];

// ─── Rating Options: minimum score filters ────────────────────────────────────

export const MIN_RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "5", label: "5.0+" },
  { value: "6", label: "6.0+" },
  { value: "7", label: "7.0+" },
  { value: "8", label: "8.0+" },
];
