import { Link } from "react-router-dom";
import { ArrowRightIcon, HeartIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useFavorites } from "../../../context/FavoritesContext";

const EmptyState = () => (
  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm sm:p-10">
    <div className="flex items-center gap-3 text-sky-300">
      <HeartIcon className="h-5 w-5" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">
        Collection Preview
      </p>
    </div>
    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white">
      Your shelves are waiting
    </h3>
    <p className="mt-3 max-w-2xl text-sm text-gray-400">
      Save a few favorites and this space will turn into your personal movie
      wall with genre patterns, quick picks, and recent obsessions.
    </p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        to="/movies"
        className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-black transition-all hover:scale-[1.01]"
      >
        <PlayIcon className="h-4 w-4" />
        Explore Movies
      </Link>
      <Link
        to="/trending"
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-all hover:bg-white/10"
      >
        View Trending
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  </div>
);

const MovieCard = ({ movie }) => (
  <Link
    to={`/movie/${movie.id}`}
    className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35 transition-all hover:-translate-y-1 hover:border-white/20"
  >
    <div className="relative aspect-[2/3] overflow-hidden">
      <img
        src={movie.posterImage || movie.image}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
        {movie.genres?.[0] || "Movie"}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="line-clamp-2 text-lg font-semibold tracking-tight text-white">
          {movie.title}
        </p>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-white/70">
          <span>{movie.subtitle || "Now streaming"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            {movie.rating}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const ProfileCollection = () => {
  const { favorites } = useFavorites();
  const recentFavorites = [...favorites].slice(-3).reverse();
  const uniqueGenres = new Set(favorites.flatMap((m) => m.genres || [])).size;

  if (favorites.length === 0) return <EmptyState />;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm sm:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">
            Collection Preview
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Recent favorites
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            {favorites.length} saved titles across {uniqueGenres || 1} genres.
          </p>
        </div>
        <Link
          to="/favorites"
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-all hover:bg-white/10 lg:self-auto"
        >
          Open Favorites
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {recentFavorites.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default ProfileCollection;
