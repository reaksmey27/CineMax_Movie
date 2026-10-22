import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import WatchHistoryList from "../../components/movies/WatchHistoryList";

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { history, loading, error, saveError, retry } = useWatchHistory();
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 text-[var(--color-text)] sm:px-12 lg:px-24">
      <h1 className="mb-4 text-3xl font-bold">{t("History")}</h1>
      <p className="mb-8 text-[var(--color-text-muted)]">
        {t("Find your last 50 movies and continue watching another day.")}
      </p>
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
        <WatchHistoryList />
      ) : (
        <p>{t("Movies you start watching will appear here.")}</p>
      )}
      {saveError && (
        <p role="alert" className="mt-4 text-amber-300">
          {t("Could not save watch history.")}
        </p>
      )}
    </main>
  );
}
