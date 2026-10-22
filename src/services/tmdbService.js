import {
  DEFAULT_CACHE_TTL,
  LONG_CACHE_TTL,
  GENRE_CACHE_TTL,
} from "./tmdb/tmdbConfig";
import { fetchFromTMDB } from "./tmdb/tmdbClient";
import {
  GENRE_MAP,
  getBackdropImage,
  getImageUrl,
  getPosterImage,
  getReleaseYear,
} from "./tmdb/tmdbImages";

// ─── tmdbService: public TMDB endpoints ───────────────────────────────────────

export const tmdbService = {
  getTrendingMovies: async () => {
    const data = await fetchFromTMDB(
      "/trending/movie/day",
      {},
      { ttl: DEFAULT_CACHE_TTL },
    );
    return data?.results || [];
  },

  getMovieCollection: async (collection, page = 1) => {
    const endpoint =
      collection === "top-rated" ? "/movie/top_rated" : "/movie/now_playing";
    return fetchFromTMDB(endpoint, { page }, { ttl: DEFAULT_CACHE_TTL });
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

  searchMovies: async (query, page = 1, releaseYear = "") => {
    return await fetchFromTMDB(
      "/search/movie",
      { query, page, primary_release_year: releaseYear },
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

  GENRE_MAP,

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
        ? movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean)
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
