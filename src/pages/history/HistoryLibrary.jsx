import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import WatchHistoryList from "../../components/movies/WatchHistoryList";

const CONTROL =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-purple-400";

export default function HistoryLibrary({ history }) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const normalize = (value) =>
    value.normalize("NFKC").toLocaleLowerCase(language);
  const search = normalize(query.trim());
  const watchedCount = history.filter((item) => item.completed).length;
  const visible = history
    .filter(
      (item) =>
        normalize(item.title || "").includes(search) &&
        (status === "all" ||
          (status === "watched" ? item.completed : !item.completed)),
    )
    .sort((a, b) => {
      const recent =
        (Date.parse(b.lastWatchedAt) || 0) - (Date.parse(a.lastWatchedAt) || 0);
      if (sort === "title")
        return (a.title || "").localeCompare(b.title || "", language) || recent;
      return sort === "oldest" ? -recent : recent;
    });
  const reset = () => {
    setQuery("");
    setStatus("all");
    setSort("recent");
  };
  return (
    <section aria-label={t("History")}>
      <div className="mb-5 grid gap-4 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-3">
        <label className="min-w-0 sm:col-span-2 lg:col-span-1">
          {t("Search watch history")}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={CONTROL}
          />
        </label>
        <label className="min-w-0">
          {t("Watch status")}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={CONTROL}
          >
            <option value="all">
              {t("All")} ({history.length})
            </option>
            <option value="unfinished">
              {t("Continue watching")} ({history.length - watchedCount})
            </option>
            <option value="watched">
              {t("Watched")} ({watchedCount})
            </option>
          </select>
        </label>
        <label className="min-w-0">
          {t("Sort By")}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className={CONTROL}
          >
            <option value="recent">{t("Recently watched")}</option>
            <option value="oldest">{t("Oldest watched")}</option>
            <option value="title">{t("Title A-Z")}</option>
          </select>
        </label>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-[var(--color-text-muted)]">
          {t("Showing {count} of {total} movies", {
            count: visible.length,
            total: history.length,
          })}
        </p>
        {(query || status !== "all" || sort !== "recent") && (
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold hover:bg-[var(--color-surface-1)]"
          >
            {t("Reset filters")}
          </button>
        )}
      </div>
      {visible.length ? (
        <WatchHistoryList movies={visible} />
      ) : (
        <p className="rounded-2xl border border-[var(--color-border)] px-5 py-12 text-center text-[var(--color-text-muted)]">
          {t("No saved movies match your search or status.")}
        </p>
      )}
    </section>
  );
}
