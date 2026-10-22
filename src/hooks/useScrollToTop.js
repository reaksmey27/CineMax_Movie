import { useLayoutEffect, useRef } from "react";

const positions = new Map();

// Track browser-history entries, not URLs: the same route can be visited twice.
export default function useScrollToTop(location) {
  const { key, pathname, search } = location;
  const previousEntry = useRef(null);
  useLayoutEffect(() => {
    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const url = pathname + search;
    // Closing an auth popup replaces its entry with the background URL.
    const saved =
      positions.get(key) ??
      (previousEntry.current?.url === url
        ? previousEntry.current.position
        : null);
    let position = saved ?? { x: 0, y: 0 };
    let restoring = Boolean(saved);
    const restore = () => {
      if (restoring)
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: "instant",
        });
    };
    const record = () => {
      if (!restoring) position = { x: window.scrollX, y: window.scrollY };
    };
    const stop = () => {
      restoring = false;
      observer.disconnect();
      record();
    };
    const onKeyDown = (event) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Tab",
        ].includes(event.key)
      )
        stop();
    };
    const observer = new ResizeObserver(restore);
    if (saved) {
      restore();
      observer.observe(document.body);
      observer.observe(document.querySelector("main") || document.body);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    // Allow lazy routes and cached results to finish rendering. User input wins.
    const timer = window.setTimeout(stop, 10000);
    window.addEventListener("scroll", record, { passive: true });
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      previousEntry.current = { url, position };
      positions.delete(key);
      positions.set(key, position);
      if (positions.size > 100) positions.delete(positions.keys().next().value);
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", record);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", onKeyDown);
      window.history.scrollRestoration = previousMode;
    };
  }, [key, pathname, search]);
}
