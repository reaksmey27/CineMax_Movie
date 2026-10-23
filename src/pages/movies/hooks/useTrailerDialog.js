import { useEffect, useRef, useState } from "react";

export default function useTrailerDialog(movie, isOpen, onClose) {
  const playerRef = useRef(null);
  const minimizeRef = useRef(null);
  const expandRef = useRef(null);
  const openerRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const hasTrailer = Boolean(movie.trailerKey);
  const isActive = hasTrailer && (isOpen || isMinimized);

  // ─── Effects: open state & scroll lock ────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement;
      const frame = requestAnimationFrame(() => minimizeRef.current?.focus());
      return () => cancelAnimationFrame(frame);
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
    if (!isOpen || isMinimized) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isActive || isMinimized) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMinimized(false);
        onClose();
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
  }, [isActive, isMinimized, onClose]);

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

  return {
    playerRef,
    minimizeRef,
    expandRef,
    isMinimized,
    isActive,
    minimizePlayer,
    expandPlayer,
    stopPlayer,
  };
}
