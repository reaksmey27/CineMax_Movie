import { useState } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import WatchHistoryList from "../../components/movies/WatchHistoryList";

const CONTROL =
  "min-h-11 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm font-normal text-[var(--color-text)] transition-colors hover:border-purple-500/50 focus:border-purple-500 focus:outline-2 focus:outline-offset-2 focus:outline-purple-500/40";

export default function HistoryLibrary({ header, history }) {
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
      <div className="mb-6 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
        {header}
        <div className="ml-auto grid w-full gap-3 text-xs font-semibold text-[var(--color-text-muted)] sm:max-w-[720px] sm:grid-cols-2 2xl:grid-cols-[1.4fr_1fr_1fr]">
          <label className="min-w-0 sm:col-span-2 2xl:col-span-1">
            {t("Search watch history")}
            <span className="relative mt-1.5 block">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="search"
                placeholder={t("Search movies") + "…"}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${CONTROL} pl-11 pr-3 placeholder:text-[var(--color-text-muted)] placeholder:opacity-80`}
              />
            </span>
          </label>
          <label className="min-w-0">
            {t("Watch status")}
            <span className="relative mt-1.5 block">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`${CONTROL} appearance-none pl-3.5 pr-10`}
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
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            </span>
          </label>
          <label className="min-w-0">
            {t("Sort By")}
            <span className="relative mt-1.5 block">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className={`${CONTROL} appearance-none pl-3.5 pr-10`}
              >
                <option value="recent">{t("Recently watched")}</option>
                <option value="oldest">{t("Oldest watched")}</option>
                <option value="title">{t("Title A-Z")}</option>
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            </span>
          </label>
        </div>
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
            className="min-h-11 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 text-sm font-semibold transition-colors hover:bg-purple-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
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
