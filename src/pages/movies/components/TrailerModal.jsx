import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

// ─── TrailerFrame: iframe with load skeleton ──────────────────────────────────

const TrailerFrame = ({ src, title, className }) => {
  const [frameLoading, setFrameLoading] = useState(true);

  useEffect(() => {
    if (!frameLoading) return undefined;
    const timer = window.setTimeout(() => setFrameLoading(false), 4000);
    return () => window.clearTimeout(timer);
  }, [frameLoading]);

  return (
    <div className="relative">
      <iframe
        className={className}
        src={src}
        title={title}
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setFrameLoading(false)}
      />
      {frameLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85"
        >
          <div className="h-4 w-1/2 max-w-64 animate-pulse rounded-full bg-white/20" />
          <div className="h-3 w-1/3 max-w-40 animate-pulse rounded-full bg-white/10" />
        </div>
      )}
    </div>
  );
};

// ─── TrailerModal: YouTube trailer dialog ─────────────────────────────────────

const TrailerModal = ({ movie, isOpen, onClose }) => {
  const { t } = useLanguage();
  const playerRef = useRef(null);
  const minimizeRef = useRef(null);
  const expandRef = useRef(null);
  const openerRef = useRef(null);
  const previousOverflowRef = useRef("");
  const [isMinimized, setIsMinimized] = useState(false);
  const hasTrailer = Boolean(movie.trailerKey);
  const isActive = hasTrailer && (isOpen || isMinimized);

  // ─── Effects: open state & scroll lock ────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement;
      previousOverflowRef.current = document.body.style.overflow;
      requestAnimationFrame(() => minimizeRef.current?.focus());
      return undefined;
    }

    if (
      openerRef.current instanceof HTMLElement &&
      openerRef.current.isConnected
    ) {
      openerRef.current.focus();
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && !isMinimized ? "hidden" : previousOverflowRef.current;
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isActive || isMinimized) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMinimized(true);
        requestAnimationFrame(() => expandRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = playerRef.current?.querySelectorAll(
        "button:not([disabled]), iframe",
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event) => {
      if (playerRef.current?.contains(event.target)) return;
      playerRef.current
        ?.querySelector("button:not([disabled]), iframe")
        ?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [isActive, isMinimized]);

  useEffect(
    () => () => {
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  if (!isActive) return null;

  // ─── Handlers: minimize, expand & stop ────────────────────────────────────────

  const minimizePlayer = () => {
    setIsMinimized(true);
    requestAnimationFrame(() => expandRef.current?.focus());
  };

  const expandPlayer = () => {
    setIsMinimized(false);
    requestAnimationFrame(() => minimizeRef.current?.focus());
  };

  const stopPlayer = () => {
    setIsMinimized(false);
    onClose();
  };

  // ─── Render: portal trailer dialog ────────────────────────────────────────────

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
