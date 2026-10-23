import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useWatchlist } from "../../context/WatchlistContext";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import useMovieDetail from "../../hooks/movies/useMovieDetail";
import MovieInfo from "./components/MovieInfo";
import MovieCredits from "./components/MovieCredits";
import RelatedMovies from "./components/RelatedMovies";
import MoviePlayer from "./components/MoviePlayer";
import TrailerModal from "./components/TrailerModal";
import MovieDetailSkeleton from "./components/MovieDetailSkeleton";
import PageError from "../../components/ui/PageError";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

// ─── MovieDetailPage: details, trailer & player ───────────────────────────────

const MovieDetailContent = ({ id }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    history,
    loading: historyLoading,
    error: historyError,
    retry,
  } = useWatchHistory();
  const saved = history.find(
    (item) => item.id === Number(id) && !item.completed,
  );
  const { toggleFavorite, isFavorite, isSavingFavorite } = useFavorites();
  const { toggleWatchlist, isInWatchlist, isSavingToWatchlist } =
    useWatchlist();

  // ─── State: details & player state from hook ──────────────────────────────────

  const {
    movie,
    loading,
    SERVERS,
    showTrailer,
    setShowTrailer,
    isPlaying,
    setIsPlaying,
    activeServer,
    setActiveServer,
    selectServer,
    currentServer,
    iframeLoading,
    playerMessage,
    currentServerUrl,
    playerInstance,
    nextServerName,
    goToNextServer,
    reloadPlayer,
    handleIframeLoad,
    handleIframeError,
  } = useMovieDetail(id);

  // ─── Guards: skeleton & not-found states ──────────────────────────────────────

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (!movie) {
    return (
      <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24 xl:px-40 min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
        <PageError
          message={t("Movie not found")}
          buttonLabel={t("Go Back")}
          icon={XMarkIcon}
        />
      </div>
    );
  }

  // ─── Render: backdrop, player & info ──────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      {!isPlaying && (
        <div className="absolute inset-0 h-[50vh] sm:h-[70vh] w-full">
          <img
            src={movie.backdropImage || movie.image}
            alt=""
            className="h-full w-full object-cover"
            style={{ opacity: "var(--movie-backdrop-opacity)" }}
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--movie-hero-gradient-vertical)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--movie-hero-gradient-horizontal)" }}
          />
        </div>
      )}

      <div
        className={`relative z-10 mx-auto max-w-[1600px] px-4 sm:px-12 lg:px-24 xl:px-40 ${isPlaying ? "pt-20 sm:pt-24" : "pt-24 sm:pt-32"} pb-16 sm:pb-20`}
      >
        <button
          onClick={() => (isPlaying ? setIsPlaying(false) : navigate(-1))}
          className="group mb-6 flex items-center gap-2 rounded-xl border border-[var(--color-hero-border)] bg-[var(--color-hero-surface)] px-4 py-2 text-[var(--color-hero-muted)] transition-colors backdrop-blur-md hover:bg-[var(--color-hero-surface-strong)] hover:text-[var(--color-hero-text)] active:scale-95 sm:mb-8"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">
            {isPlaying ? t("Close Player") : t("Return")}
          </span>
        </button>

        {historyError && (
          <p role="alert" className="mb-4 text-amber-300">
            {t("Could not load watch history.")}{" "}
            <button className="underline" onClick={retry}>
              {t("Try again")}
            </button>
          </p>
        )}
        {isPlaying && isAuthenticated ? (
          <MoviePlayer
            key={`${movie.id}-${activeServer}-${playerInstance}`}
            movie={movie}
            SERVERS={SERVERS}
            activeServer={activeServer}
            currentServer={currentServer}
            currentServerUrl={currentServerUrl}
            iframeLoading={iframeLoading}
            playerMessage={playerMessage}
            playerInstance={playerInstance}
            nextServerName={nextServerName}
            onServerChange={selectServer}
            onIframeLoad={handleIframeLoad}
            onIframeError={handleIframeError}
            onNextServer={goToNextServer}
            onReloadPlayer={reloadPlayer}
          />
        ) : (
          <MovieInfo
            movie={movie}
            progress={saved}
            isFav={isFavorite(movie.id)}
            isWatchlisted={isInWatchlist(movie.id)}
            favoritePending={isSavingFavorite(movie.id)}
            watchlistPending={isSavingToWatchlist(movie.id)}
            playLabel={
              authLoading
                ? t("Checking login...")
                : isAuthenticated
                  ? saved
                    ? t("Continue watching")
                    : t("Play Movie")
                  : t("Log in to Watch")
            }
            playDisabled={
              authLoading ||
              (isAuthenticated && (historyLoading || historyError))
            }
            onPlay={() => {
              if (authLoading || historyLoading || historyError) return;
              if (!isAuthenticated) {
                navigate("/login", {
                  state: {
                    backgroundLocation: location,
                    returnTo: `/movie/${id}`,
                  },
                });
                return;
              }
              if (
                saved &&
                SERVERS.some((server) => server.name === saved.server)
              )
                setActiveServer(saved.server);
              setIsPlaying(true);
            }}
            onTrailer={() => setShowTrailer(true)}
            onFavorite={() => toggleFavorite(movie)}
            onWatchlist={() => toggleWatchlist(movie)}
          />
        )}
        {!isPlaying && (
          <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
            <MovieCredits movie={movie} />
            <RelatedMovies movieId={movie.id} />
          </div>
        )}
      </div>

      {movie.trailerKey && (
        <TrailerModal
          movie={movie}
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default function MovieDetailPage() {
  const { id } = useParams();
  return <MovieDetailContent key={id} id={id} />;
}
