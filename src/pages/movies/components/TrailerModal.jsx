import TrailerFrame from "./TrailerFrame";
import useTrailerDialog from "../hooks/useTrailerDialog";
import { createPortal } from "react-dom";
import TrailerControls from "./TrailerControls";

// ─── TrailerModal: YouTube trailer dialog ─────────────────────────────────────

const TrailerModal = ({ movie, isOpen, onClose }) => {
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
      onClick={(event) => {
        if (!isMinimized && event.target === event.currentTarget) {
          stopPlayer();
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
          <TrailerControls
            isMinimized={isMinimized}
            minimizeRef={minimizeRef}
            expandRef={expandRef}
            onMinimize={minimizePlayer}
            onExpand={expandPlayer}
            onStop={stopPlayer}
          />
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
