import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

const CONTROL =
  "min-h-12 w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm font-normal text-[var(--color-text)] transition-colors hover:border-purple-500/50 focus:border-purple-500 focus:outline-2 focus:outline-offset-2 focus:outline-purple-500/40";

export default function CollectionFilters({
  searchLabel,
  query,
  setQuery,
  sort,
  setSort,
  status,
  setStatus,
  total,
  watchedCount,
  count,
  reset,
}) {
  const { t } = useLanguage();
  const select = (label, value, onChange, options) => (
    <label className="min-w-0">
      {label}
      <span className="relative mt-2 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} appearance-none pl-3.5 pr-10`}
        >
          {options.map(([key, text]) => (
            <option key={key} value={key}>
              {text}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
      </span>
    </label>
  );
  return (
    <>
      <div
        className={`mb-4 grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 text-sm font-semibold text-[var(--color-text)] sm:grid-cols-2 sm:p-5 ${setStatus ? "lg:grid-cols-[2fr_1fr_1fr]" : "lg:grid-cols-[2fr_1fr]"}`}
      >
        <label
          className={`min-w-0 ${setStatus ? "sm:col-span-2 lg:col-span-1" : ""}`}
        >
          {searchLabel}
          <span className="relative mt-2 block">
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
        {setStatus &&
          select(t("Watch status"), status, setStatus, [
            ["all", `${t("All")} (${total})`],
            ["unwatched", `${t("To watch")} (${total - watchedCount})`],
            ["watched", `${t("Watched")} (${watchedCount})`],
          ])}
        {select(t("Sort By"), sort, setSort, [
          ["saved", t("Recently saved")],
          ["title", t("Title A-Z")],
          ["rating", t("Highest Rated")],
        ])}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-[var(--color-text-muted)]">
          {t("Showing {count} of {total} movies", { count, total })}
        </p>
        {(query || (status && status !== "all") || sort !== "saved") && (
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-purple-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
          >
            {t("Reset filters")}
          </button>
        )}
      </div>
    </>
  );
}
