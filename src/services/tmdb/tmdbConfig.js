// ─── Constants: API credentials, URLs & cache TTLs ────────────────────────────

const API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim() || "";
const READ_ACCESS_TOKEN =
  import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN?.trim() || "";

export const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
export const LONG_CACHE_TTL = 30 * 60 * 1000;
export const GENRE_CACHE_TTL = 24 * 60 * 60 * 1000;

const INVALID_API_KEY_VALUES = new Set([
  "",
  "your_tmdb_api_key",
  "332625e9a1fcfb93329932bfebe2ba33",
]);

// ─── Credentials: bearer token or API key ─────────────────────────────────────

const looksLikeBearerToken = (value) => value.split(".").length === 3;

export const bearerToken =
  READ_ACCESS_TOKEN || (looksLikeBearerToken(API_KEY) ? API_KEY : "");
export const apiKey = bearerToken ? "" : API_KEY;
export const hasTmdbCredentials =
  Boolean(bearerToken) ||
  (Boolean(apiKey) && !INVALID_API_KEY_VALUES.has(apiKey));

// Validate API key on module load
if (!hasTmdbCredentials) {
  console.error(
    "TMDB credentials are missing or invalid. Add VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN to your .env file.",
  );
  console.error(
    "Get your TMDB credentials from: https://www.themoviedb.org/settings/api",
  );
}
