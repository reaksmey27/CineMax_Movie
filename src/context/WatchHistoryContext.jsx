/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const Context = createContext(null);
const loadStorage = () =>
  Promise.all([
    import("../firebase/firestore"),
    import("../firebase/watchHistory"),
  ]);

function Session({ userId, children }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const records = useRef([]);
  const pending = useRef(new Set());
  const [busy, setBusy] = useState(new Set());
  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setAttempt((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let unsubscribe;
    loadStorage()
      .then(([{ db }, storage]) => {
        if (cancelled) return;
        unsubscribe = storage.subscribeWatchHistory(
          db,
          userId,
          (items) => {
            if (cancelled) return;
            records.current = items;
            setHistory(items);
            setLoading(false);
            setError(false);
          },
          () => {
            if (!cancelled) {
              setError(true);
              setLoading(false);
            }
          },
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [userId, attempt]);

  const record = useCallback(
    async (movie, details, starting = false) => {
      if (!userId) return false;
      const previous = records.current.find((item) => item.id === movie.id);
      if (!starting && previous?.completed) return true;
      try {
        const [{ db }, storage] = await loadStorage();
        await storage.saveWatchHistory(db, userId, movie, details);
        setSaveError(false);
        return true;
      } catch {
        setSaveError(true);
        return false;
      }
    },
    [userId],
  );

  const change = useCallback(
    async (movieId, action) => {
      if (!userId || pending.current.has(movieId)) return false;
      pending.current.add(movieId);
      setBusy(new Set(pending.current));
      try {
        const [{ db }, storage] = await loadStorage();
        const update =
          action === "remove"
            ? storage.removeWatchHistory
            : action === "unfinished"
              ? storage.markWatchHistoryUnfinished
              : storage.finishWatchHistory;
        await update(db, userId, movieId);
        setSaveError(false);
        return true;
      } catch {
        setSaveError(true);
        return false;
      } finally {
        pending.current.delete(movieId);
        setBusy(new Set(pending.current));
      }
    },
    [userId],
  );
  const value = useMemo(
    () => ({
      history,
      loading,
      error,
      saveError,
      retry,
      record,
      finish: (id) => change(id, "finish"),
      markUnfinished: (id) => change(id, "unfinished"),
      remove: (id) => change(id, "remove"),
      isBusy: (id) => busy.has(id),
    }),
    [history, loading, error, saveError, retry, record, change, busy],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function WatchHistoryProvider({ children }) {
  const { user } = useAuth();
  return (
    <Session key={user?.uid || "guest"} userId={user?.uid || null}>
      {children}
    </Session>
  );
}
export function useWatchHistory() {
  const value = useContext(Context);
  if (!value) throw new Error("WatchHistoryProvider is required.");
  return value;
}
