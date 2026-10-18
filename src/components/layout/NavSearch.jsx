import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import { tmdbService } from "../../services/tmdbService";
import LiveSearchDropdown from "../../pages/movies/components/LiveSearchDropdown";

export default function NavSearch({ onOpen }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState({
    query: "",
    results: [],
    error: false,
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmed = query.trim();
  const loading = response.query !== trimmed;
  const results = loading ? [] : response.results;
  const showResults = open && trimmed.length >= 2;

  useEffect(() => {
    if (!open || trimmed.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await tmdbService.searchMovies(trimmed, 1);
        if (!cancelled)
          setResponse({
            query: trimmed,
            results: (data?.results || []).slice(0, 6),
            error: false,
          });
      } catch {
        if (!cancelled)
          setResponse({ query: trimmed, results: [], error: true });
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, trimmed]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  const selectMovie = (movie) => {
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      ref={rootRef}
      className="sm:relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        aria-label={t("Search movies")}
        aria-expanded={open}
        aria-controls="nav-search-form"
        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-2)] sm:min-h-11 sm:min-w-11 sm:hidden"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            onOpen();
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
      <form
        id="nav-search-form"
        role="search"
        aria-label={t("Find movies")}
        className={`${open ? "block" : "hidden"} absolute inset-x-2 top-full mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-3 shadow-xl sm:static sm:mt-0 sm:block sm:w-56 lg:w-64 sm:rounded-full sm:bg-[var(--color-surface-1)] sm:p-0 sm:shadow-none 2xl:w-80`}
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed) return;
          setOpen(false);
          inputRef.current?.blur();
          navigate(`/movies?q=${encodeURIComponent(trimmed)}`);
        }}
      >
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label={t("Search movies")}
            aria-autocomplete="list"
            aria-expanded={showResults}
            aria-controls={showResults ? "nav-live-search-results" : undefined}
            aria-activedescendant={
              showResults && results[activeIndex]
                ? `nav-live-search-results-${results[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
            placeholder={`${t("Search movies")}…`}
            value={query}
            className="[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none min-h-11 w-full rounded-full bg-transparent pl-10 pr-10 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-purple-500"
            onFocus={() => {
              setOpen(true);
              onOpen();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                inputRef.current?.blur();
                if (window.matchMedia("(max-width: 639px)").matches)
                  toggleRef.current?.focus();
              } else if (
                showResults &&
                results.length &&
                ["ArrowDown", "ArrowUp"].includes(event.key)
              ) {
                event.preventDefault();
                setActiveIndex((index) =>
                  event.key === "ArrowDown"
                    ? (index + 1) % results.length
                    : index <= 0
                      ? results.length - 1
                      : index - 1,
                );
              } else if (
                showResults &&
                event.key === "Enter" &&
                results[activeIndex]
              ) {
                event.preventDefault();
                selectMovie(results[activeIndex]);
              }
            }}
          />
          {query && (
            <button
              type="button"
              aria-label={t("Clear search")}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {showResults && (
          <div className="relative sm:absolute sm:right-0 sm:top-full sm:w-[26rem] sm:max-w-[calc(100vw-3rem)]">
            {!loading && response.error ? (
              <p
                role="status"
                className="mt-2 rounded-xl bg-[var(--color-panel-bg)] p-4 text-sm text-[var(--color-text)]"
              >
                {t(
                  "Live search is unavailable. Press Enter to try the results page.",
                )}
              </p>
            ) : (
              <LiveSearchDropdown
                listId="nav-live-search-results"
                query={trimmed}
                results={results}
                isLoading={loading}
                onViewAll={() => {
                  setOpen(false);
                  inputRef.current?.blur();
                  navigate(`/movies?q=${encodeURIComponent(trimmed)}`);
                }}
                activeIndex={activeIndex}
                onSelect={selectMovie}
                onHoverIndex={setActiveIndex}
              />
            )}
          </div>
        )}
      </form>
    </div>
  );
}
