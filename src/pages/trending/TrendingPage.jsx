import React from "react";
import { FireIcon } from "@heroicons/react/24/outline";
import useTrendingMovies from "../../hooks/movies/useTrendingMovies";
import MovieGrid from "../../components/ui/MovieGrid";
import MovieGridSkeleton from "../../components/ui/MovieGridSkeleton";
import PageError from "../../components/ui/PageError";
import { useLanguage } from "../../context/LanguageContext";

// ─── TrendingPage: trending movies grid ───────────────────────────────────────

const TrendingPage = () => {
  const { t } = useLanguage();
  const { movies, loading, error } = useTrendingMovies();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      <div className="absolute top-0 left-1/4 w-150 h-125 bg-orange-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-purple-600/10 blur-[120px] rounded-full -z-10" />

      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-4 sm:mb-16">
          <div className="mb-2 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FireIcon className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500 sm:tracking-[0.3em]">
              {t("On Fire Today")}
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl md:text-6xl">
            {t("Trending")} <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-purple-500">
              {t("Masterpieces")}
            </span>
          </h1>
          <p className="max-w-sm text-sm font-medium text-gray-400">
            {t(
              "The most watched and talked about movies in the last 24 hours. Updated in real-time.",
            )}
          </p>
        </div>

        {error ? (
          <PageError
            message={error}
            buttonLabel={t("Retry Sync")}
            buttonColor="bg-orange-500 text-white hover:bg-orange-600"
            icon={FireIcon}
            iconColor="text-orange-500"
            borderColor="border-orange-500/10 bg-orange-500/5"
          />
        ) : loading ? (
          <MovieGridSkeleton />
        ) : (
          <MovieGrid movies={movies} />
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
