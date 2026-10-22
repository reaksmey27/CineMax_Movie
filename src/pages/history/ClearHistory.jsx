import { useEffect, useRef, useState } from "react";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { useLanguage } from "../../context/LanguageContext";

export default function ClearHistory() {
  const { history, clear, clearing, canClear } = useWatchHistory();
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const cancelRef = useRef(null);
  const triggerRef = useRef(null);
  const wasConfirming = useRef(false);
  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current)
      triggerRef.current?.focus({ preventScroll: true });
    wasConfirming.current = confirming;
  }, [confirming]);
  if (!history.length && !confirming) return null;
  const cancel = () => {
    if (!clearing) {
      setConfirming(false);
      setFailed(false);
    }
  };
  return (
    <div
      className="mb-6"
      onKeyDown={(event) => {
        if (event.key === "Escape" && confirming && !clearing) {
          event.preventDefault();
          cancel();
        }
      }}
    >
      {!confirming ? (
        <button
          ref={triggerRef}
          type="button"
          disabled={!canClear}
          onClick={() => setConfirming(true)}
          className="min-h-11 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          {t("Clear history")}
        </button>
      ) : (
        <section
          aria-labelledby="clear-history-title"
          aria-busy={clearing}
          className="rounded-2xl border border-red-500/30 bg-[var(--color-surface-1)] p-4 sm:p-5"
        >
          <h2 id="clear-history-title" className="font-semibold">
            {t("Clear watch history?")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {t(
              "All watch history and saved progress will be removed. This cannot be undone.",
            )}
          </p>
          {failed && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {t("Could not clear watch history. Try again.")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              ref={cancelRef}
              type="button"
              disabled={clearing}
              onClick={cancel}
              className="min-h-11 rounded-xl border border-[var(--color-border)] px-5 text-sm disabled:opacity-50"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              disabled={clearing || !canClear}
              onClick={async () => {
                setFailed(false);
                if (await clear()) setConfirming(false);
                else setFailed(true);
              }}
              className="min-h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {clearing
                ? t("Clearing...")
                : failed
                  ? t("Try again")
                  : t("Clear history")}
            </button>
          </div>
          {clearing && (
            <p role="status" className="mt-3 text-sm">
              {t("Clearing...")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
