import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORT_OPTIONS,
} from "../../config/movieFilters.js";

const DISCOVER_SORT_VALUES = new Set(
  DISCOVER_SORT_OPTIONS.map((option) => option.value),
);

export function parseMovieSearchParams(searchParams) {
  const pageParam = searchParams.get("page") || "1";
  const parsedPage = /^\d+$/.test(pageParam) ? Number(pageParam) : NaN;
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const genreParam = searchParams.get("genre");
  const parsedGenre = genreParam ? parseInt(genreParam, 10) : null;
  const selectedGenre = Number.isNaN(parsedGenre) ? null : parsedGenre;
  const collectionParam = searchParams.get("collection");
  const collection = ["top-rated", "now-playing"].includes(collectionParam)
    ? collectionParam
    : "";
  const collectionTitle =
    collection === "top-rated"
      ? "Top Rated"
      : collection === "now-playing"
        ? "Now Playing"
        : "";
  const searchQuery = searchParams.get("q") || "";
  const releaseYearParam = searchParams.get("year") || "";
  const minRatingParam = searchParams.get("rating") || "";
  const sortParam = searchParams.get("sort") || DEFAULT_DISCOVER_SORT;
  const releaseYear = /^\d{4}$/.test(releaseYearParam) ? releaseYearParam : "";
  const minRating = /^\d+(\.\d+)?$/.test(minRatingParam) ? minRatingParam : "";
  const sortBy = DISCOVER_SORT_VALUES.has(sortParam)
    ? sortParam
    : DEFAULT_DISCOVER_SORT;

  const hasActiveFilters = Boolean(
    collection ||
    selectedGenre ||
    releaseYear ||
    minRating ||
    sortBy !== DEFAULT_DISCOVER_SORT,
  );
  return {
    page,
    selectedGenre,
    collection,
    collectionTitle,
    searchQuery,
    releaseYear,
    minRating,
    sortBy,
    hasActiveFilters,
  };
}
