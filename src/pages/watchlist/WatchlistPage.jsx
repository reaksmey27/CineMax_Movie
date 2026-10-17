import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import MovieGrid from "../../components/ui/MovieGrid";
import PageLoader from "../../components/ui/PageLoader";
import { useAuth } from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";

const WatchlistPage = () => {
  const location = useLocation();
  const modalState = { backgroundLocation: location };
  const { isAuthenticated } = useAuth();
  const { watchlist, loading } = useWatchlist();

  if (loading) {
    return (
      <PageLoader color="border-amber-500" label="Syncing Your Watchlist..." />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      <div className="absolute right-0 top-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-[120px] sm:h-[31rem] sm:w-[31rem]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-purple-600/10 blur-[120px] sm:h-[31rem] sm:w-[31rem]" />

      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-4 sm:mb-16">
          <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl md:text-5xl">
            Your <span className="text-amber-400">Watchlist</span>
          </h1>
          <p className="max-w-lg text-sm font-medium text-gray-400">
            Sign in to save movies to your account and keep your watchlist
            synced across devices.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-[25rem] sm:p-12">
            <BookmarkIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              Sign in to use your watchlist
            </h3>
            <p className="mb-8 max-w-md font-medium text-gray-500">
              Your saved movies sync in real time through Firestore, so this
              page is only available when you are signed in.
            </p>
            <Link
              to="/login"
              state={modalState}
              className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 sm:w-auto sm:px-10"
            >
              Sign In
            </Link>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-[25rem] sm:p-12">
            <BookmarkIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              Your watchlist is empty
            </h3>
            <p className="mb-8 max-w-md font-medium text-gray-500">
              Save movies from the catalog to build a personal queue that
              updates instantly anywhere you sign in.
            </p>
            <Link
              to="/movies"
              className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95 sm:w-auto sm:px-10"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <MovieGrid movies={watchlist} />
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
