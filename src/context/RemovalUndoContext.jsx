/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

const Context = createContext(null);
function Session({ userId, children }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const active = useRef(true);
  const pending = useRef(new Set());
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const offerUndo = useCallback(
    (collection, movie) => {
      if (!userId || !active.current || !movie) return;
      const entry = {
        key: `${collection}-${movie.id}`,
        collection,
        movie: { ...movie },
        token: Symbol(),
        busy: false,
        error: false,
      };
      setItems((current) => [
        ...current.filter((item) => item.key !== entry.key),
        entry,
      ]);
    },
    [userId],
  );
  const undo = async (entry) => {
    if (pending.current.has(entry.key) || !active.current) return;
    pending.current.add(entry.key);
    const update = (changes) => {
      if (active.current)
        setItems((current) =>
          current.map((item) =>
            item.token === entry.token ? { ...item, ...changes } : item,
          ),
        );
    };
    update({ busy: true, error: false });
    try {
      const [{ db }, { restoreMovie }] = await Promise.all([
        import("../firebase/firestore"),
        import("../firebase/restoreMovie"),
      ]);
      if (!active.current) return;
      await restoreMovie(db, userId, entry.collection, entry.movie);
      if (active.current)
        setItems((current) =>
          current.filter((item) => item.token !== entry.token),
        );
    } catch {
      update({ busy: false, error: true });
    } finally {
      pending.current.delete(entry.key);
    }
  };
  return (
    <Context.Provider value={offerUndo}>
      {children}
      {items.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-[150] flex max-h-[45vh] flex-col gap-2 overflow-y-auto sm:right-auto sm:w-96">
          {items.map((entry) => (
            <div
              key={entry.key}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-[var(--color-text)] shadow-2xl"
            >
              <p role="status" className="break-words text-sm leading-relaxed">
                {t("Removed {title} from {collection}.", {
                  title: entry.movie.title,
                  collection:
                    entry.collection === "favorites"
                      ? t("Favorites")
                      : entry.collection === "watchlists"
                        ? t("Watchlist")
                        : t("History"),
                })}
              </p>
              {entry.error && (
                <p role="alert" className="mt-2 text-sm">
                  {t("Could not restore this movie. Try again.")}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={entry.busy}
                  aria-busy={entry.busy}
                  onClick={() => undo(entry)}
                  className="min-h-11 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-purple-400 disabled:opacity-60"
                >
                  {entry.busy ? t("Saving...") : t("Undo")}
                </button>
                <button
                  type="button"
                  disabled={entry.busy}
                  aria-label={t("Dismiss")}
                  onClick={() =>
                    setItems((current) =>
                      current.filter((item) => item.token !== entry.token),
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-400 disabled:opacity-60"
                >
                  <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Context.Provider>
  );
}

export function RemovalUndoProvider({ children }) {
  const { user } = useAuth();
  return (
    <Session key={user?.uid || "guest"} userId={user?.uid}>
      {children}
    </Session>
  );
}
export function useRemovalUndo() {
  const value = useContext(Context);
  if (!value) throw new Error("RemovalUndoProvider is required.");
  return value;
}
