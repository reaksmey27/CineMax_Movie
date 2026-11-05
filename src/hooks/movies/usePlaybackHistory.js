import { useCallback, useEffect, useRef, useState } from "react";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { readPlayerProgress } from "../../utils/player/watchProgress";
import { createPlaybackTracker } from "../../utils/player/watchTracking";

export default function usePlaybackHistory(movie, server, iframeRef) {
  const { history, record, saveError } = useWatchHistory();
  const [setup] = useState(() => {
    const saved = history.find((item) => item.id === movie.id);
    const resumable =
      saved && !saved.completed && saved.server === server.name ? saved : null;
    const tracker = createPlaybackTracker({
      watchedRanges: saved?.watchedRanges,
      durationSeconds: saved?.durationSeconds,
      completed: saved?.completed === true,
    });
    return {
      tracker,
      wasCompleted: saved?.completed === true,
      progress: {
        positionSeconds: resumable?.positionSeconds || 0,
        server: server.name,
        ...tracker.snapshot(),
      },
    };
  });
  const { tracker } = setup;
  const latest = useRef(setup.progress);
  const lastSaved = useRef(0);
  const dirty = useRef(false);
  const completed = useRef(setup.progress.completed);

  const persistState = useCallback(
    (details) => {
      dirty.current = false;
      lastSaved.current = Date.now();
      if (details.completed) completed.current = true;
      void record(movie, details).then((saved) => {
        if (!saved) {
          dirty.current = true;
          completed.current = false;
        }
      });
    },
    [movie, record],
  );

  const persist = useCallback(
    (progress, force = false) => {
      if (completed.current) return;
      const snapshot = tracker.sample(progress);
      latest.current = {
        ...snapshot,
        positionSeconds: progress.positionSeconds,
        server: server.name,
      };
      dirty.current = true;
      if (
        !force &&
        !snapshot.completed &&
        Date.now() - lastSaved.current < 15000
      )
        return;
      persistState(latest.current);
    },
    [tracker, server.name, persistState],
  );

  useEffect(() => {
    // Opening the player starts the history entry. A movie that is already
    // watched keeps its completed flag and no duplicate entry is created.
    if (!setup.wasCompleted) void record(movie, setup.progress, true);
    lastSaved.current = Date.now();
    const flush = () => {
      if (dirty.current) persistState(latest.current);
    };
    const onMessage = (event) => {
      const progress = readPlayerProgress(
        event,
        iframeRef.current?.contentWindow,
        server,
        movie.id,
      );
      if (progress)
        persist(
          { ...progress, playing: !progress.force && !progress.completed },
          progress.force,
        );
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush();
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [movie, server, iframeRef, persist, persistState, record, setup]);

  const retrySave = () => persistState(latest.current);
  return {
    initialPosition: setup.progress.positionSeconds,
    persist,
    saveError,
    retrySave,
  };
}
