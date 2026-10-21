import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookmarkIcon,
  HeartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useFavorites } from "../../../context/FavoritesContext";
import { useWatchlist } from "../../../context/WatchlistContext";
import { useLanguage } from "../../../context/LanguageContext";
import MovieCard from "../../../components/ui/MovieCard";
import MovieGridSkeleton from "../../../components/ui/MovieGridSkeleton";

// ─── Sub-components: saved movie row ──────────────────────────────────────────

const SavedMovie = ({ movie, listName, onRemove, onRemoved }) => {
  const { t } = useLanguage();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(false);
  const busy = useRef(false);
  const remove = async () => {
    if (busy.current) return;
    busy.current = true;
    setRemoving(true);
    setError(false);
    try {
      const result = await onRemove(movie);
      if (result === false) setError(true);
      else onRemoved();
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setRemoving(false);
    }
  };
  return (
    <li className="min-w-0">
      <MovieCard
        movie={movie}
        headingLevel="h3"
        showActions={false}
        hideUnrated
      />
      <button
        type="button"
        disabled={removing}
        onClick={remove}
        aria-label={t("Remove {title} from {list}", {
          title: movie.title,
          list: t(listName),
        })}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-purple-500 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
        {removing ? t("Removing...") : t("Remove")}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[var(--color-text-muted)]">
          {t("Could not remove this movie. Please try again.")}
        </p>
      )}
    </li>
  );
};

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

  const activate = (id) => {
    setActiveTab(id);
    tabRefs.current[id]?.focus();
  };

  // ─── Render: tabs & saved movie grid ──────────────────────────────────────────

  return (
    <section className="mt-8 sm:mt-10" aria-label={t("Saved movies")}>
      <div
        role="tablist"
        aria-label={t("Movie collections")}
        className="flex gap-2 border-b border-[var(--color-border)] sm:gap-6"
      >
        {tabs.map((tab, index) => {
          const TabIcon = tab.icon;
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              id={`profile-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`profile-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                activate(
                  tabs[
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : event.key === "ArrowRight"
                          ? (index + 1) % tabs.length
                          : (index - 1 + tabs.length) % tabs.length
                  ].id,
                );
              }}
              className={`inline-flex min-h-14 flex-1 items-center justify-center gap-2 border-b-2 px-2 pb-3 pt-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-purple-500 sm:flex-none sm:px-4 ${selected ? "border-purple-500 text-[var(--color-text)]" : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
            >
              <TabIcon
                className="hidden h-5 w-5 min-[360px]:block"
                aria-hidden="true"
              />
              {tab.title}
              <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs tabular-nums">
                {tab.count ?? "..."}
              </span>
            </button>
          );
        })}
      </div>
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
