import CollectionState, {
  CollectionLoading,
} from "../../components/movies/CollectionState";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import WatchlistLibrary from "./WatchlistLibrary";
import { useAuth } from "../../context/AuthContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { useLanguage } from "../../context/LanguageContext";

// ─── WatchlistPage: saved watchlist grid ──────────────────────────────────────

const WatchlistPage = () => {
  const location = useLocation();
  const modalState = { backgroundLocation: location };
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { watchlist, loading, error, retry, setWatched, isSavingToWatchlist } =
    useWatchlist();

  const header = (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <BookmarkIcon aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="page-heading page-heading--amber">{t("Watchlist")}</h1>
      </div>
      <p className="max-w-lg text-sm leading-relaxed text-gray-400 sm:text-base">
        {isAuthenticated
          ? t(
              "Find your next movie, organize saved titles, and keep track of what you've watched.",
            )
          : t(
              "Sign in to save movies to your account and keep your watchlist synced across devices.",
            )}
      </p>
    </div>
  );
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      <div className="absolute right-0 top-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-500/10 blur-[120px] sm:h-[31rem] sm:w-[31rem]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-purple-600/10 blur-[120px] sm:h-[31rem] sm:w-[31rem]" />

      <div className="mx-auto max-w-[1400px]">
        {!(isAuthenticated && !loading && !error && watchlist.length > 0) && (
          <div className="mb-10 sm:mb-16">{header}</div>
        )}

        {!isAuthenticated ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-[25rem] sm:p-12">
            <BookmarkIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              {t("Sign in to use your watchlist")}
            </h3>
            <p className="mb-8 max-w-md font-medium text-gray-500">
              {t(
                "Your saved movies sync in real time through Firestore, so this page is only available when you are signed in.",
              )}
            </p>
            <Link
              to="/login"
              state={modalState}
              className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 sm:w-auto sm:px-10"
            >
              {t("Sign In")}
            </Link>
          </div>
        ) : loading ? (
          <CollectionLoading label={t("Syncing Your Watchlist...")} />
        ) : error ? (
          <CollectionState
            error
            title={t("Error")}
            message={t("We couldn't sync your watchlist right now.")}
            onAction={retry}
            actionLabel={t("Try again")}
          />
        ) : watchlist.length === 0 ? (
          <CollectionState
            title={t("Your watchlist is empty")}
            message={t(
              "Save movies you want to watch and find them here whenever you are ready.",
            )}
            actionTo="/movies"
            actionLabel={t("Browse Movies")}
          />
        ) : (
          <WatchlistLibrary
            header={header}
            movies={watchlist}
            setWatched={setWatched}
            isSaving={isSavingToWatchlist}
          />
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
