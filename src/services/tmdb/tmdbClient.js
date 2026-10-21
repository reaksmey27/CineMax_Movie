import {
  BASE_URL,
  DEFAULT_CACHE_TTL,
  apiKey,
  bearerToken,
  hasTmdbCredentials,
} from "./tmdbConfig";
import {
  buildCacheKey,
  cleanParams,
  deletePendingRequest,
  getCachedResponse,
  getPendingRequest,
  setPendingRequest,
  setCachedResponse,
} from "./tmdbCache";

// ─── fetchFromTMDB: cached fetch with error mapping ───────────────────────────

export const fetchFromTMDB = async (
  endpoint,
  params = {},
  { ttl = DEFAULT_CACHE_TTL, forceRefresh = false } = {},
) => {
  if (!hasTmdbCredentials) {
    throw new Error(
      "TMDB credentials are missing. Add VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN to your .env file.",
    );
  }

  const cacheKey = buildCacheKey(endpoint, params);

  if (!forceRefresh) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
    const pendingRequest = getPendingRequest(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }
  }

  const queryParams = new URLSearchParams(cleanParams(params));

  if (apiKey) {
    queryParams.set("api_key", apiKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const requestUrl = queryParams.toString()
    ? `${BASE_URL}${endpoint}?${queryParams}`
    : `${BASE_URL}${endpoint}`;
  const headers = bearerToken
    ? {
        Authorization: `Bearer ${bearerToken}`,
      }
    : undefined;

  const request = (async () => {
    try {
      const response = await fetch(requestUrl, {
        signal: controller.signal,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid TMDB credentials. Please check VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file.",
          );
        }
        if (response.status === 429) {
          throw new Error("API rate limit exceeded. Please try again later.");
        }
        if (response.status >= 500) {
          throw new Error(
            "TMDB service is currently unavailable. Please try again later.",
          );
        }
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data = await response.json();
      setCachedResponse(cacheKey, data, ttl);
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(
          "Request timed out. Please check your internet connection.",
        );
      }
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          "Network error. Please check your internet connection or try using a VPN.",
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      deletePendingRequest(cacheKey);
    }
  })();

  setPendingRequest(cacheKey, request);
  return request;
};
