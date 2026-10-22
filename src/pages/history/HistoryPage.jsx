import CollectionState, {
  CollectionLoading,
} from "../../components/movies/CollectionState";
import { Link } from "react-router-dom";
import { ClockIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import HistoryLibrary from "./HistoryLibrary";
import ClearHistory from "./ClearHistory";

export default function HistoryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { history, loading, error, saveError, retry } = useWatchHistory();
  const { t } = useLanguage();
  const header = (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <ClockIcon aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="page-heading page-heading--violet">{t("History")}</h1>
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
        <CollectionLoading
          history
          label={t("Loading {title}", { title: t("History") })}
        />
      ) : !isAuthenticated ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[var(--color-surface-1)] to-[var(--color-surface-1)] px-5 py-10 text-center sm:min-h-80 sm:px-8 sm:py-12">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <ClockIcon aria-hidden="true" className="h-8 w-8" />
          </span>
          <h2 className="text-xl font-bold leading-relaxed sm:text-2xl">
            {t("Log in to Watch")}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
            {t("Movies you start watching will appear here.")}
          </p>
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Link
              to="/login"
              state={{ returnTo: "/history" }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
            >
              {t("Sign In")}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              to="/movies"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
            >
              {t("Browse Movies")}
            </Link>
          </div>
        </section>
      ) : error ? (
        <CollectionState
          error
          title={t("Error")}
          message={t("Could not load watch history.")}
          onAction={retry}
          actionLabel={t("Try again")}
        />
      ) : history.length ? (
        <HistoryLibrary header={header} history={history} />
      ) : (
        <CollectionState
          title={t("History")}
          message={t("Movies you start watching will appear here.")}
          actionTo="/movies"
          actionLabel={t("Browse Movies")}
        />
      )}
      {isAuthenticated && !authLoading && !loading && !error && (
        <div className="mt-6">
          <ClearHistory key={user?.uid} />
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
