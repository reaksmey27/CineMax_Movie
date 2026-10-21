import { IMAGE_BASE_URL } from "./tmdbConfig";

// ─── Helpers: image URLs & release year ───────────────────────────────────────

export const getImageUrl = (path, size = "w780") => {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
};

export const getBackdropImage = (movie) => {
  return (
    getImageUrl(movie.backdrop_path, "w1280") ||
    getImageUrl(movie.poster_path, "w780") ||
    ""
  );
};

export const getPosterImage = (movie) => {
  return (
    getImageUrl(movie.poster_path, "w780") ||
    getImageUrl(movie.backdrop_path, "w780") ||
    ""
  );
};

export const getReleaseYear = (movie) => {
  if (movie.release_date) {
    return new Date(movie.release_date).getFullYear().toString();
  }

  if (movie.first_air_date) {
    return new Date(movie.first_air_date).getFullYear().toString();
  }

  return "";
};

// ─── Constants: TMDB genre id → name map ──────────────────────────────────────

export const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};
