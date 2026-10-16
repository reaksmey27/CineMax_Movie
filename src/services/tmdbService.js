const API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim() || "";
const READ_ACCESS_TOKEN =
  import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN?.trim() || "";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
const LONG_CACHE_TTL = 30 * 60 * 1000;
const GENRE_CACHE_TTL = 24 * 60 * 60 * 1000;
const responseCache = new Map();
const pendingRequests = new Map();
const INVALID_API_KEY_VALUES = new Set([
  "",
  "your_tmdb_api_key",
  "332625e9a1fcfb93329932bfebe2ba33",
]);

const looksLikeBearerToken = (value) => value.split(".").length === 3;
const bearerToken =
  READ_ACCESS_TOKEN || (looksLikeBearerToken(API_KEY) ? API_KEY : "");
const apiKey = bearerToken ? "" : API_KEY;
const hasTmdbCredentials =
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

const buildCacheKey = (endpoint, params) => {
  const sortedParams = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify([endpoint, sortedParams]);
};

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

const getCachedResponse = (cacheKey) => {
  const cached = responseCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cached.data;
};

const setCachedResponse = (cacheKey, data, ttl) => {
  responseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

const fetchFromTMDB = async (
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
    const pendingRequest = pendingRequests.get(cacheKey);
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
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

const getImageUrl = (path, size = "w780") => {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
};

const getBackdropImage = (movie) => {
  return (
    getImageUrl(movie.backdrop_path, "w1280") ||
    getImageUrl(movie.poster_path, "w780") ||
    ""
  );
};

const getPosterImage = (movie) => {
  return (
    getImageUrl(movie.poster_path, "w780") ||
    getImageUrl(movie.backdrop_path, "w780") ||
    ""
  );
};

const getReleaseYear = (movie) => {
  if (movie.release_date) {
    return new Date(movie.release_date).getFullYear().toString();
  }

  if (movie.first_air_date) {
    return new Date(movie.first_air_date).getFullYear().toString();
  }

  return "";
};

export const tmdbService = {
  getTrendingMovies: async () => {
    const data = await fetchFromTMDB(
      "/trending/movie/day",
      {},
      { ttl: DEFAULT_CACHE_TTL },
    );
    return data?.results || [];
  },

  getNowPlayingMovies: async () => {
    const data = await fetchFromTMDB(
      "/movie/now_playing",
      {},
      { ttl: DEFAULT_CACHE_TTL },
    );
    return data?.results || [];
  },

  getPopularMovies: async () => {
    const data = await fetchFromTMDB(
      "/movie/popular",
      {},
      { ttl: DEFAULT_CACHE_TTL },
    );
    return data?.results || [];
  },

  discoverMovies: async (page = 1, filters = {}) => {
    return await fetchFromTMDB(
      "/discover/movie",
      {
        page,
        sort_by: filters.sortBy,
        with_genres: filters.genreId,
        primary_release_year: filters.releaseYear,
        "vote_average.gte": filters.minRating,
      },
      { ttl: DEFAULT_CACHE_TTL },
    );
  },

  getMoviesByGenre: async (genreId, page = 1) => {
    return await tmdbService.discoverMovies(page, { genreId });
  },

  getGenres: async () => {
    const data = await fetchFromTMDB(
      "/genre/movie/list",
      {},
      { ttl: GENRE_CACHE_TTL },
    );
    return data.genres;
  },

  getUpcomingMovies: async () => {
    const data = await fetchFromTMDB(
      "/movie/upcoming",
      {},
      { ttl: LONG_CACHE_TTL },
    );
    return data?.results || [];
  },

  getTopRatedMovies: async () => {
    const data = await fetchFromTMDB(
      "/movie/top_rated",
      {},
      { ttl: LONG_CACHE_TTL },
    );
    return data?.results || [];
  },

  getMovieDetails: async (movieId) => {
    return await fetchFromTMDB(
      `/movie/${movieId}`,
      { append_to_response: "videos,credits" },
      { ttl: LONG_CACHE_TTL },
    );
  },

  searchMovies: async (query, page = 1) => {
    return await fetchFromTMDB(
      "/search/movie",
      { query, page },
      { ttl: DEFAULT_CACHE_TTL },
    );
  },

  getMoviesByIds: async (movieIds) => {
    const fetchPromises = movieIds.map((id) =>
      fetchFromTMDB(`/movie/${id}`, {}, { ttl: LONG_CACHE_TTL }).catch(
        () => null,
      ),
    );
    const results = await Promise.all(fetchPromises);
    return results.filter(Boolean);
  },

  getImageUrl,

  GENRE_MAP: {
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
  },

  formatMovieData: (movie) => {
    const trailer = movie.videos?.results?.find(
      (vid) => vid.type === "Trailer" && vid.site === "YouTube",
    );

    return {
      id: movie.id,
      title: movie.title || movie.name,
      subtitle: getReleaseYear(movie),
      rating: movie.vote_average?.toFixed(1) || "0.0",
      duration: movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : "",
      genres: movie.genre_ids
        ? movie.genre_ids.map((id) => tmdbService.GENRE_MAP[id]).filter(Boolean)
        : movie.genres
          ? movie.genres.map((genre) => genre.name)
          : [],
      description: movie.overview,
      image: getPosterImage(movie),
      posterImage: getPosterImage(movie),
      backdropImage: getBackdropImage(movie),
      trailerKey: trailer ? trailer.key : null,
    };
  },
};
