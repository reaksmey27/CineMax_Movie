import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const TrailerModal = ({ movie, onClose }) => {
  if (!movie.trailerKey) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="trailer-frame relative w-full max-w-6xl aspect-video bg-black rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(168,85,247,0.4)] border border-white/20 animate-in zoom-in duration-500">
        <button
          aria-label="Close trailer"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[210] p-3 sm:p-4 bg-black/60 hover:bg-red-600 text-white rounded-full transition-all active:scale-90 backdrop-blur-xl border border-white/10 group"
        >
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0`}
          title={`${movie.title} Trailer`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;
