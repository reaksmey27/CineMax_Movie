import CollectionState, {
  CollectionLoading,
} from "../../components/movies/CollectionState";
import { Link, useLocation } from "react-router-dom";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import FavoritesLibrary from "./FavoritesLibrary";
import { useLanguage } from "../../context/LanguageContext";

// ─── FavoritesPage: saved favorites grid ──────────────────────────────────────

const FavoritesPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { favorites, loading, error, retry } = useFavorites();
  const isEmpty = favorites.length === 0;

  const header = (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <HeartOutlineIcon aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="page-heading page-heading--rose">{t("Favorites")}</h1>
      </div>
      <p className="max-w-lg text-sm leading-relaxed text-gray-400 sm:text-base">
        {isAuthenticated
          ? t(
              "Tap the heart on a movie you love to start your personal collection.",
            )
          : t(
              "Sign in to save your favorite movies and sync your collection across devices.",
            )}
      </p>
    </div>
  );
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-16 pt-22 sm:px-6 sm:pb-24 sm:pt-28 lg:px-24 lg:pt-36 xl:px-40">
      <div className="absolute right-0 top-0 -z-10 h-125 w-125 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="mx-auto max-w-350">
        {!(isAuthenticated && !loading && !error && !isEmpty) && (
          <div className="mb-10 sm:mb-16">{header}</div>
        )}

        {!isAuthenticated ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border-2 border-white/5 bg-white/5 p-6 text-center backdrop-blur-sm sm:min-h-100 sm:p-12">
            <HeartOutlineIcon className="mb-6 h-16 w-16 text-gray-600" />
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
              {t("Sign in to save favorites")}
            </h3>
            <p className="mb-8 max-w-sm font-medium text-gray-500">
              {t(
                "Sign in to sync your favorite movies with your account and access them on any device.",
              )}
            </p>
            <Link
              to="/login"
              state={{ backgroundLocation: location }}
              className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-95 sm:w-auto sm:px-10"
            >
              {t("Sign In")}
            </Link>
          </div>
        ) : loading ? (
          <CollectionLoading label={t("Syncing Your Favorites...")} />
        ) : error ? (
          <CollectionState
            error
            title={t("Error")}
            message={t(
              "Your favorites could not sync. Please try again to load your saved movies.",
            )}
            onAction={retry}
            actionLabel={t("Try again")}
          />
        ) : isEmpty ? (
          <CollectionState
            title={t("Your list is empty")}
            message={t(
              "Tap the heart on a movie you love to start your personal collection.",
            )}
            actionTo="/movies"
            actionLabel={t("Browse Movies")}
          />
        ) : (
          <FavoritesLibrary header={header} movies={favorites} />
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
