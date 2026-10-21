import { useEffect, useRef, useState } from "react";

export default function useTrailerDialog(movie, isOpen, onClose) {
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
