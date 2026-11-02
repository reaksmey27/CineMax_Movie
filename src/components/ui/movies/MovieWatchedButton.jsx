import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { useWatchHistory } from "../../../context/WatchHistoryContext";

const buttonClass =
  "flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] px-2 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500 disabled:opacity-50";

function Toggle({ movie, watched }) {
  const { t } = useLanguage();
  const { setWatched, isBusy, loading, error } = useWatchHistory();
  const [failed, setFailed] = useState(false);
  return (
    <div>
      <button
        type="button"
        className={buttonClass}
        aria-pressed={watched}
        aria-busy={isBusy(movie.id)}
        disabled={loading || error || isBusy(movie.id)}
        onClick={async () => {
          setFailed(false);
          setFailed(!(await setWatched(movie, !watched)));
        }}
      >
        <CheckCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t(watched ? "Mark as unfinished" : "Mark as watched")}
      </button>
      {failed && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {t("Could not save watch history.")}
        </p>
      )}
    </div>
  );
}

export default function MovieWatchedButton(props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  return user ? (
    <Toggle key={user.uid} {...props} />
  ) : (
    <Link
      to="/login"
      state={{
        backgroundLocation: location,
        returnTo: location.pathname + location.search,
      }}
      className={buttonClass}
    >
      {t("Mark as watched")}
    </Link>
  );
}
