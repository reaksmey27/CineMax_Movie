import { MOVIE_COUNTRIES } from "../../config/movieCountries.js";
import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORT_OPTIONS,
  runtimeRange,
} from "../../config/movieFilters.js";

const DISCOVER_SORT_VALUES = new Set(
  DISCOVER_SORT_OPTIONS.map((option) => option.value),
);

export function parseMovieSearchParams(searchParams) {
  const pageParam = searchParams.get("page") || "1";
  const parsedPage = /^\d+$/.test(pageParam) ? Number(pageParam) : NaN;
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 100
      ? parsedPage
      : 1;
  const genreParam = searchParams.get("genre");
  const parsedGenre = /^\d+$/.test(genreParam || "") ? Number(genreParam) : NaN;
  const selectedGenre =
    Number.isSafeInteger(parsedGenre) && parsedGenre > 0 ? parsedGenre : null;
  const collectionParam = searchParams.get("collection");
  const country = MOVIE_COUNTRIES.includes(searchParams.get("country"))
    ? searchParams.get("country")
    : "";
  const collection =
    ["top-rated", "now-playing"].includes(collectionParam) &&
    !runtimeRange(searchParams.get("runtime"))?.min &&
    !country
      ? collectionParam
      : "";
  const collectionTitle =
    collection === "top-rated"
      ? "Top Rated"
      : collection === "now-playing"
        ? "Now Playing"
        : "";
  const searchQuery = searchParams.get("q") || "";
  const runtime = runtimeRange(searchParams.get("runtime"))?.value || "";
  const releaseYearParam = searchParams.get("year") || "";
  const minRatingParam = searchParams.get("rating") || "";
  const sortParam = searchParams.get("sort") || DEFAULT_DISCOVER_SORT;
  const releaseYear = /^\d{4}$/.test(releaseYearParam) ? releaseYearParam : "";
  const minRating =
    /^\d+(\.\d+)?$/.test(minRatingParam) && Number(minRatingParam) <= 10
      ? minRatingParam
      : "";
  const sortBy = DISCOVER_SORT_VALUES.has(sortParam)
    ? sortParam
    : DEFAULT_DISCOVER_SORT;

  const hasActiveFilters = Boolean(
    country ||
    collection ||
    selectedGenre ||
    releaseYear ||
    minRating ||
    runtime ||
    sortBy !== DEFAULT_DISCOVER_SORT,
  );
  return {
    country,
    page,
    selectedGenre,
    collection,
    collectionTitle,
    searchQuery,
    releaseYear,
    minRating,
    runtime,
    sortBy,
    hasActiveFilters,
  };
}
