import useMovieCollectionActions from "../../hooks/movies/useMovieCollectionActions";
import useMoviePlaybackActions from "../../hooks/movies/useMoviePlaybackActions";
import MovieDetailUnavailable from "./components/MovieDetailUnavailable";
import MovieDetailBackdrop from "./components/MovieDetailBackdrop";
import { useParams } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import useMovieDetail from "../../hooks/movies/useMovieDetail";
import MovieInfo from "./components/MovieInfo";
import MovieCredits from "./components/MovieCredits";
import RelatedMovies from "./components/RelatedMovies";
import MoviePlayer from "./components/MoviePlayer";
import TrailerModal from "./components/TrailerModal";
import MovieDetailSkeleton from "./components/MovieDetailSkeleton";
import { useLanguage } from "../../context/LanguageContext";

// ─── MovieDetailPage: details, trailer & player ───────────────────────────────

const MovieDetailContent = ({ id }) => {
  const { t } = useLanguage();
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
  const collections = useMovieCollectionActions(movie);
  const playback = useMoviePlaybackActions(id, {
    isPlaying,
    setIsPlaying,
    setActiveServer,
  });

  // ─── Guards: skeleton & not-found states ──────────────────────────────────────

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (!movie) return <MovieDetailUnavailable />;

  // ─── Render: backdrop, player & info ──────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      {!isPlaying && <MovieDetailBackdrop movie={movie} />}

      <div
        className={`relative z-10 mx-auto max-w-[1600px] px-4 sm:px-12 lg:px-24 xl:px-40 ${isPlaying ? "pt-20 sm:pt-24" : "pt-24 sm:pt-32"} pb-16 sm:pb-20`}
      >
        <button
          onClick={playback.goBack}
          className="group mb-6 flex items-center gap-2 rounded-xl border border-[var(--color-hero-border)] bg-[var(--color-hero-surface)] px-4 py-2 text-[var(--color-hero-muted)] transition-colors backdrop-blur-md hover:bg-[var(--color-hero-surface-strong)] hover:text-[var(--color-hero-text)] active:scale-95 sm:mb-8"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">
            {isPlaying ? t("Close Player") : t("Return")}
          </span>
        </button>

        {playback.historyError && (
          <p role="alert" className="mb-4 text-amber-300">
            {t("Could not load watch history.")}{" "}
            <button className="underline" onClick={playback.retryHistory}>
              {t("Try again")}
            </button>
          </p>
        )}
        {isPlaying && playback.isAuthenticated ? (
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
            {...collections}
            {...playback.infoProps}
            onTrailer={() => setShowTrailer(true)}
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
