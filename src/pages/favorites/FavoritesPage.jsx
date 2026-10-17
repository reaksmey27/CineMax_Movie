import { Link, useLocation } from "react-router-dom";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import MovieGrid from "../../components/ui/MovieGrid";
import PageError from "../../components/ui/PageError";
import PageLoader from "../../components/ui/PageLoader";

const FavoritesPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { favorites, loading, error, retry } = useFavorites();
  const isEmpty = favorites.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      <div className="absolute right-0 top-0 -z-10 h-125 w-125 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="mx-auto max-w-350">
        <div className="mb-10 flex flex-col gap-6 sm:mb-16 sm:gap-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl md:text-5xl">
              Your
              <br />
              <span className="text-purple-500">Favorites</span>
            </h1>
            <p className="max-w-sm text-sm font-medium text-gray-400">
              Sign in to save your favorite movies and sync your collection
              across devices.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-100 sm:p-12">
            <HeartOutlineIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              Sign in to save favorites
            </h3>
            <p className="mb-8 max-w-sm font-medium text-gray-500">
              Sign in to sync your favorite movies with your account and access
              them on any device.
            </p>
            <Link
              to="/login"
              state={{ backgroundLocation: location }}
              className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95 sm:w-auto sm:px-10"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <PageLoader
            color="border-purple-500"
            label="Syncing Your Favorites..."
          />
        ) : error ? (
          <PageError
            message="Your favorites could not sync. Please try again to load your saved movies."
            onRetry={retry}
          />
        ) : isEmpty ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-100 sm:p-12">
            <HeartOutlineIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              Your list is empty
            </h3>
            <p className="mb-8 max-w-sm font-medium text-gray-500">
              You haven&apos;t added any movies to your favorites yet. Start
              exploring and click the heart icon.
            </p>
            <Link
              to="/movies"
              className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95 sm:w-auto sm:px-10"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <MovieGrid movies={favorites} />
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
