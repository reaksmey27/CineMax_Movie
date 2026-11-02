import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../../context/LanguageContext";

export default function PublicVisitorPreference({ user }) {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    let unsubscribe;
    import("../../../../firebase/publicVisitors")
      .then((storage) => {
        if (!active) return;
        unsubscribe = storage.subscribeVisitorPreference(
          user.uid,
          (value) => {
            if (active) {
              setEnabled(value);
              setLoading(false);
              setFailed(false);
            }
          },
          () => {
            if (active) setFailed(true);
          },
        );
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user.uid, attempt]);
  const toggle = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setFailed(false);
    try {
      const storage = await import("../../../../firebase/publicVisitors");
      await storage.setVisitorPreference(user, !enabled);
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <section className="mt-6 rounded-2xl border border-[var(--color-border)] p-5">
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-text)]">
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading || saving}
          onChange={toggle}
          className="h-5 w-5 accent-purple-600"
        />
        {t("Show my photo in recent visitors")}
      </label>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {t(
          "Your photo will be visible to everyone. Turn this off to remove it from the public list.",
        )}
      </p>
      {failed && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {t("Could not update visitor preference.")}{" "}
          {loading && (
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                setFailed(false);
                setAttempt((value) => value + 1);
              }}
            >
              {t("Try again")}
            </button>
          )}
        </p>
      )}
    </section>
  );
}
