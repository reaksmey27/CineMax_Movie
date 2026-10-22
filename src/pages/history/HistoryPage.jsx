import { Link } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import HistoryLibrary from "./HistoryLibrary";

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { history, loading, error, saveError, retry } = useWatchHistory();
  const { t } = useLanguage();
  const header = (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <ClockIcon aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="page-heading page-heading--violet">
          {t("History")}
        </h1>
      </div>
      <p className="max-w-lg text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
        {t("Find your last 50 movies and continue watching another day.")}
      </p>
    </div>
  );
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] bg-[var(--color-bg)] px-4 pb-12 pt-24 text-[var(--color-text)] sm:px-8 sm:pb-20 sm:pt-36 lg:px-12 xl:px-20">
      {!(
        isAuthenticated &&
        !authLoading &&
        !loading &&
        !error &&
        history.length > 0
      ) && <div className="mb-8">{header}</div>}
      {authLoading || loading ? (
        <p role="status">{t("Loading {title}", { title: t("History") })}</p>
      ) : !isAuthenticated ? (
        <Link
          to="/login"
          state={{ returnTo: "/history" }}
          className="text-purple-400 underline"
        >
          {t("Log in to Watch")}
        </Link>
      ) : error ? (
        <p role="alert">
          {t("Could not load watch history.")}{" "}
          <button onClick={retry} className="underline">
            {t("Try again")}
          </button>
        </p>
      ) : history.length ? (
        <HistoryLibrary header={header} history={history} />
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-5 py-10 text-center sm:min-h-80">
          <div className="rounded-full bg-purple-500/10 p-4 text-purple-400">
            <ClockIcon aria-hidden="true" className="h-9 w-9" />
          </div>
          <p className="max-w-md leading-relaxed text-[var(--color-text-muted)]">
            {t("Movies you start watching will appear here.")}
          </p>
          <Link
            to="/movies"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
          >
            {t("Browse Movies")}
          </Link>
        </div>
      )}
      {saveError && (
        <p role="alert" className="mt-4 text-amber-300">
          {t("Could not save watch history.")}
        </p>
      )}
    </main>
  );
}
