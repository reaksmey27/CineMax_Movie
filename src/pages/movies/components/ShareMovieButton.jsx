import { useRef, useState } from "react";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

export default function ShareMovieButton({ movie }) {
  const { t } = useLanguage();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const share = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);
    const data = {
      title: movie.title,
      url: new URL(
        `/movie/${encodeURIComponent(movie.id)}`,
        window.location.origin,
      ).href,
    };
    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(data))
      ) {
        await navigator.share(data);
        setMessage("Share menu opened.");
      } else {
        await navigator.clipboard.writeText(data.url);
        setMessage("Movie link copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setFailed(true);
        setMessage("Could not share this movie. Try again.");
      }
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={share}
        disabled={busy}
        aria-busy={busy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-purple-500/50 hover:bg-purple-500/10 disabled:cursor-wait disabled:opacity-60"
      >
        <ShareIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
        {t("Share movie")}
      </button>
      <p
        role={failed ? "alert" : "status"}
        className={`text-sm ${failed ? "text-red-400" : "text-[var(--color-text-muted)]"}`}
      >
        {message && t(message)}
      </p>
    </div>
  );
}
