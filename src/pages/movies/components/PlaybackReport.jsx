import { useEffect, useRef, useState } from "react";
import { FlagIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

export default function PlaybackReport({ movie, server }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("not-loading");
  const [status, setStatus] = useState("idle");
  const pending = useRef(false);
  const trigger = useRef(null);
  const firstOption = useRef(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) firstOption.current?.focus();
    else if (wasOpen.current) trigger.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  if (!user) return null;
  return (
    <div
      className="mx-auto w-full max-w-5xl"
      onKeyDown={(event) => {
        if (event.key === "Escape" && status !== "sending") {
          setOpen(false);
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        disabled={status === "sending"}
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] disabled:opacity-50"
      >
        <FlagIcon aria-hidden="true" className="h-4 w-4" />
        {t("Report playback problem")}
      </button>
      {open && (
        <form
          className="mt-3 space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 sm:p-5"
          aria-label={t("Report playback problem")}
          onSubmit={async (event) => {
            event.preventDefault();
            if (pending.current || status === "sent") return;
            pending.current = true;
            setStatus("sending");
            try {
              const [{ db }, { submitPlaybackReport }] = await Promise.all([
                import("../../../firebase/firestore"),
                import("../../../firebase/playbackReports"),
              ]);
              await submitPlaybackReport(db, user.uid, movie, server, issue);
              setStatus("sent");
            } catch {
              setStatus("error");
            } finally {
              pending.current = false;
            }
          }}
        >
          <p className="text-sm font-semibold break-words">
            {movie.title} · {server}
          </p>
          {status === "sent" ? (
            <p role="status" className="text-sm text-[var(--color-text)]">
              {t("Report submitted. Thank you.")}
            </p>
          ) : (
            <>
              <fieldset disabled={status === "sending"} className="space-y-2">
                <legend className="mb-2 text-sm font-semibold">
                  {t("What went wrong?")}
                </legend>
                {[
                  ["not-loading", "Video won't load"],
                  ["no-sound", "No sound"],
                  ["wrong-movie", "Wrong movie"],
                ].map(([value, label], index) => (
                  <label
                    key={value}
                    className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm has-checked:border-purple-500 has-checked:bg-purple-500/10"
                  >
                    <input
                      ref={index === 0 ? firstOption : undefined}
                      type="radio"
                      name="playback-issue"
                      value={value}
                      checked={issue === value}
                      onChange={() => setIssue(value)}
                      className="h-4 w-4 accent-purple-500"
                    />
                    {t(label)}
                  </label>
                ))}
              </fieldset>
              {status === "error" && (
                <p role="alert" className="text-sm text-red-400">
                  {t("Could not submit the report. Try again.")}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                aria-busy={status === "sending"}
                className="min-h-11 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {status === "sending"
                  ? t("Submitting...")
                  : status === "error"
                    ? t("Try again")
                    : t("Submit report")}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={status === "sending"}
            onClick={() => setOpen(false)}
            className="ml-3 min-h-11 rounded-xl px-3 text-sm disabled:opacity-50"
          >
            {t("Dismiss")}
          </button>
        </form>
      )}
    </div>
  );
}
