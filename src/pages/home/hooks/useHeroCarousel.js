import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants: hero rotation timings ─────────────────────────────────────────

const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 600;
const DOT_DURATION = 400;

// ─── useHeroCarousel: slide index, fade transitions & auto-rotation ───────────

export const useHeroCarousel = ({ slideCount, isEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const transitionTimer = useRef(null);

  // ─── Effects: rotation & reduced motion ──────────────────────────────────────

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  // ─── Helpers: slide transitions & navigation ─────────────────────────────────

  const stopRotation = () => {
    setPaused(true);
    window.clearTimeout(transitionTimer.current);
    setFade(true);
  };

  const transition = useCallback(
    (getNext, delay = FADE_DURATION) => {
      window.clearTimeout(transitionTimer.current);
      if (reducedMotion) {
        setCurrentIndex(getNext);
        setFade(true);
        return;
      }
      setFade(false);
      transitionTimer.current = window.setTimeout(() => {
        setCurrentIndex(getNext);
        setFade(true);
      }, delay);
    },
    [reducedMotion],
  );

  const handleNext = useCallback(() => {
    transition((prev) => (prev + 1) % slideCount);
  }, [slideCount, transition]);

  const handlePrev = useCallback(() => {
    transition((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  }, [slideCount, transition]);

  const goTo = useCallback(
    (idx) => {
      transition(() => idx, DOT_DURATION);
    },
    [transition],
  );

  useEffect(() => {
    if (slideCount < 2 || !isEnabled || paused || reducedMotion) return;
    const id = setInterval(handleNext, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [slideCount, isEnabled, paused, reducedMotion, handleNext]);

  return {
    currentIndex,
    fade,
    paused,
    setPaused,
    stopRotation,
    handleNext,
    handlePrev,
    goTo,
  };
};
