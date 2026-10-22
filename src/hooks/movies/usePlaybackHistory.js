import { useCallback, useEffect, useRef, useState } from "react";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { readPlayerProgress } from "../../utils/player/watchProgress";

export default function usePlaybackHistory(movie, server, iframeRef) {
  const { history, record, saveError } = useWatchHistory();
  const [initial] = useState(() => {
    const saved = history.find(
      (item) =>
        item.id === movie.id && item.server === server.name && !item.completed,
    );
    return {
      positionSeconds: saved?.positionSeconds || 0,
      durationSeconds: saved?.durationSeconds || 0,
    };
  });
  const latest = useRef(initial);
  const lastSaved = useRef(0);
  const dirty = useRef(false);
  const completed = useRef(false);
  const persist = useCallback(
    (progress, force = false) => {
      if (completed.current) return;
      latest.current = progress;
      dirty.current = true;
      if (!force && Date.now() - lastSaved.current < 15000) return;
      lastSaved.current = Date.now();
      dirty.current = false;
      if (progress.completed) completed.current = true;
      void record(movie, { ...progress, server: server.name }).then((saved) => {
        if (!saved) {
          dirty.current = true;
          completed.current = false;
        }
      });
    },
    [movie, server.name, record],
  );

  useEffect(() => {
    void record(
      movie,
      { ...initial, server: server.name, completed: false },
      true,
    );
    lastSaved.current = Date.now();
    const flush = () => {
      if (dirty.current && !completed.current) persist(latest.current, true);
    };
    const onMessage = (event) => {
      const progress = readPlayerProgress(
        event,
        iframeRef.current?.contentWindow,
        server,
        movie.id,
      );
      if (progress) persist(progress, progress.force);
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
  }, [movie, server, iframeRef, persist, record, initial]);
  const retrySave = () =>
    record(movie, { ...latest.current, server: server.name }, true);
  return {
    initialPosition: initial.positionSeconds,
    persist,
    saveError,
    retrySave,
  };
}
