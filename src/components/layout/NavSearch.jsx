import useNavSearch from "./navbar/useNavSearch";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import LiveSearchDropdown from "../../pages/movies/components/LiveSearchDropdown";

// ─── NavSearch: navbar live search ────────────────────────────────────────────

export default function NavSearch({ onOpen }) {
  const { t } = useLanguage();
  const {
    rootRef,
    inputRef,
    toggleRef,
    open,
    setOpen,
    query,
    setQuery,
    response,
    activeIndex,
    setActiveIndex,
    trimmed,
    loading,
    results,
    showResults,
    selectMovie,
    retry,
    navigate,
  } = useNavSearch();

  return (
    <div
      ref={rootRef}
      className="md:relative"
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
        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-2)] sm:min-h-11 sm:min-w-11 md:hidden"
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
        className={`${open ? "block" : "hidden"} absolute inset-x-2 top-full mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-3 shadow-xl md:static md:mt-0 md:block md:w-48 lg:w-64 xl:w-48 md:rounded-full md:bg-[var(--color-surface-1)] md:p-0 md:shadow-none 2xl:w-84`}
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
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                inputRef.current?.blur();
                if (window.matchMedia("(max-width: 767px)").matches)
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
              <div
                className="mt-2 rounded-xl bg-[var(--color-panel-bg)] p-4 text-sm text-[var(--color-text)]"
              >
                <p role="status">
                {t(
                  "Live search is unavailable. Press Enter to try the results page.",
                )}
                </p>
                <button type="button" onClick={retry} className="mt-2 min-h-11 rounded-lg bg-purple-600 px-4 font-semibold text-white hover:bg-purple-500">
                  {t("Try again")}
                </button>
              </div>
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
