import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";

const TrailerModal = ({ movie, onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const hasTrailer = Boolean(movie.trailerKey);

  useEffect(() => {
    if (!hasTrailer) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [hasTrailer]);

  if (!hasTrailer) return null;

  return createPortal(
    <dialog ref={dialogRef} aria-label={`${movie.title} trailer`} aria-modal="true"
      className="trailer-dialog fixed inset-0 m-auto w-[calc(100%-1.5rem)] max-w-6xl overflow-visible rounded-2xl border border-white/20 bg-black p-0 text-white shadow-2xl backdrop:bg-black/90 backdrop:backdrop-blur-md"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="flex items-center justify-between gap-4 border-b border-white/20 px-4 py-2">
        <h2 className="min-w-0 truncate text-sm font-semibold">{movie.title} trailer</h2>
        <button ref={closeRef} type="button" aria-label="Close trailer" onClick={onClose}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <iframe className="aspect-video w-full rounded-b-2xl"
        src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
        title={`${movie.title} trailer`}
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen />
    </dialog>,
    document.body,
  );
};

export default TrailerModal;
