import TrailerFrame from "./TrailerFrame";
import useTrailerDialog from "../hooks/useTrailerDialog";
import { createPortal } from "react-dom";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

// ─── TrailerFrame: iframe with load skeleton ──────────────────────────────────

// ─── TrailerModal: YouTube trailer dialog ─────────────────────────────────────

const TrailerModal = ({ movie, isOpen, onClose }) => {
  const { t } = useLanguage();
  const {
    playerRef,
    minimizeRef,
    expandRef,
    isMinimized,
    isActive,
    minimizePlayer,
    expandPlayer,
    stopPlayer,
  } = useTrailerDialog(movie, isOpen, onClose);
  if (!isActive) return null;

  return createPortal(
    <section
      className={
        isMinimized
          ? "fixed bottom-4 right-4 z-[300] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 bg-slate-950 text-white shadow-2xl shadow-black/50"
          : "fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-3 text-white backdrop-blur-md sm:p-6"
      }
      role="dialog"
      aria-label={
        isMinimized
          ? `${movie.title} minimized trailer player`
          : `${movie.title} trailer player`
      }
      aria-modal={isMinimized ? undefined : "true"}
      onMouseDown={(event) => {
        if (!isMinimized && event.target === event.currentTarget) {
          minimizePlayer();
        }
      }}
    >
      <div
        ref={playerRef}
        className={
          isMinimized
            ? "overflow-hidden rounded-2xl"
            : "w-full max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl"
        }
      >
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-4">
          <h2 className="min-w-0 truncate text-sm font-semibold">
            {isMinimized
              ? `Now playing: ${movie.title} trailer`
              : `${movie.title} trailer`}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {isMinimized ? (
              <>
                <button
                  ref={expandRef}
                  type="button"
                  aria-label={t("Expand trailer player")}
                  title={t("Expand player")}
                  onClick={expandPlayer}
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
                >
                  <ArrowsPointingOutIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  aria-label={t("Stop trailer")}
                  title={t("Stop trailer")}
                  onClick={stopPlayer}
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-red-500/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                ref={minimizeRef}
                type="button"
                aria-label={t("Minimize trailer and keep watching")}
                title={t("Minimize and keep watching")}
                onClick={minimizePlayer}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <TrailerFrame
          src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
          title={`${movie.title} trailer`}
          className={
            isMinimized
              ? "aspect-video w-full bg-black"
              : "aspect-video max-h-[calc(100dvh-6rem)] w-full bg-black"
          }
        />
      </div>
    </section>,
    document.body,
  );
};

export default TrailerModal;
