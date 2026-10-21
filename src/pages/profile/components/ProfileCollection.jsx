import CollectionTabs from "./CollectionTabs";
import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../../../context/FavoritesContext";
import { useWatchlist } from "../../../context/WatchlistContext";
import { useLanguage } from "../../../context/LanguageContext";
import SavedMovie from "./SavedMovie";
import MovieGridSkeleton from "../../../components/ui/MovieGridSkeleton";

// ─── ProfileCollection: favorites & watchlist tabs ────────────────────────────

const ProfileCollection = () => {
  const { t } = useLanguage();
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    retry: retryFavorites,
    removeFromFavorites,
  } = useFavorites();
  const { watchlist, loading, error, retry, removeFromWatchlist } =
    useWatchlist();
  // ─── State: tab from URL ──────────────────────────────────────────────────────

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "watchlist" ? "watchlist" : "favorites";
  const setActiveTab = (tab) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("tab", tab);
        return next;
      },
      { replace: true },
    );
  // ─── Derived: active list, title & counts ─────────────────────────────────────

  const tabRefs = useRef({});
  const isWatchlist = activeTab === "watchlist";
  const movies = isWatchlist ? watchlist : favorites;
  const title = t(isWatchlist ? "Watchlist" : "Favorites");
  const Icon = isWatchlist ? BookmarkIcon : HeartIcon;
  const pending = isWatchlist ? loading : favoritesLoading;
  const failed = isWatchlist ? error : favoritesError;
  const retryCollection = isWatchlist ? retry : retryFavorites;
  const tabs = [
    {
      id: "favorites",
      title: t("Favorites"),
      count: favoritesLoading || favoritesError ? null : favorites.length,
      icon: HeartIcon,
    },
    {
      id: "watchlist",
      title: t("Watchlist"),
      count: loading || error ? null : watchlist.length,
      icon: BookmarkIcon,
    },
  ];

  // ─── Handlers: switch tab with focus ──────────────────────────────────────────

  // ─── Render: tabs & saved movie grid ──────────────────────────────────────────

  return (
    <section className="mt-8 sm:mt-10" aria-label={t("Saved movies")}>
      <CollectionTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabRefs={tabRefs}
      />
      <div
        key={activeTab}
        id={`profile-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`profile-tab-${activeTab}`}
        tabIndex={0}
        className="pt-6 focus-visible:outline-2 focus-visible:outline-purple-500 sm:pt-8"
      >
        {pending ? (
          <div aria-busy="true" aria-label={`Loading ${title.toLowerCase()}`}>
            <MovieGridSkeleton />
          </div>
        ) : failed ? (
          <div className="rounded-2xl border border-[var(--color-border)] p-8 text-center">
            <h2 className="text-xl font-semibold">
              Your {title.toLowerCase()} could not sync
            </h2>
            <p
              role="status"
              className="mt-2 text-sm text-[var(--color-text-muted)]"
            >
              Please try again to load your saved movies.
            </p>
            <button
              type="button"
              onClick={retryCollection}
              className="mt-5 min-h-11 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Try again
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-1)] px-5 py-12 text-center">
            <div className="mb-5 rounded-2xl bg-purple-500/10 p-4">
              <Icon className="h-8 w-8 text-purple-500" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {isWatchlist
                ? "Your next movie is waiting"
                : "Make room for your favorites"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
              {isWatchlist
                ? "Save movies you want to watch and find them here whenever you are ready."
                : "Tap the heart on a movie you love to start your personal collection."}
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <>
            <p
              role="status"
              className="mb-5 text-sm text-[var(--color-text-muted)]"
            >
              {movies.length} {movies.length === 1 ? "movie" : "movies"} in your{" "}
              {title.toLowerCase()}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {movies.map((movie) => (
                <SavedMovie
                  key={movie.id}
                  movie={movie}
                  listName={title}
                  onRemove={
                    isWatchlist
                      ? (item) => removeFromWatchlist(item.id)
                      : (item) => removeFromFavorites(item.id)
                  }
                  onRemoved={() => tabRefs.current[activeTab]?.focus()}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};
export default ProfileCollection;
