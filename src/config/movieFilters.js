// ─── Constants: default sort for discover ─────────────────────────────────────

export const DEFAULT_DISCOVER_SORT = "popularity.desc";

export const RUNTIME_OPTIONS = [
  { value: "", label: "Any runtime" },
  { value: "short", label: "Under 90 minutes", min: 1, max: 89 },
  { value: "medium", label: "90–120 minutes", min: 90, max: 120 },
  { value: "long", label: "Over 2 hours", min: 121 },
];

export const runtimeRange = (value) =>
  RUNTIME_OPTIONS.find((option) => option.value === value);

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
