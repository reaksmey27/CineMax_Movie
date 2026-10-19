import { useEffect, useRef } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

import {
  DEFAULT_DISCOVER_SORT,
  DISCOVER_SORT_OPTIONS,
  MIN_RATING_OPTIONS,
} from "../constants";
import { useLanguage } from "../../../context/LanguageContext";

const LABEL_CLASS = "text-xs font-semibold text-[var(--color-text-muted)]";

const INPUT_CLASS =
  "w-full rounded-lg border border-white/8 bg-white/5 px-3.5 py-2 text-[15px] font-semibold text-white outline-none transition-all placeholder:text-gray-600 focus:border-purple-500/45 focus:bg-white/8 sm:py-2.5";

const GENRE_BTN_BASE =
  "rounded-xl border-2 px-5 py-2 text-sm font-semibold  whitespace-nowrap transition-all";

const FilterSelect = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onClose,
  onChange,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const triggerId = `filter-select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const optionButtons = menuRef.current?.querySelectorAll('[role="option"]');
    const selectedOption = Array.from(optionButtons ?? []).find(
      (option) => option.getAttribute("aria-selected") === "true",
    );
    selectedOption?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) onClose();
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOptionKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const optionButtons = Array.from(
      menuRef.current?.querySelectorAll('[role="option"]') ?? [],
    );
    const currentIndex = optionButtons.indexOf(event.currentTarget);
    if (currentIndex < 0 || optionButtons.length === 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? optionButtons.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : optionButtons.length - 1)) %
            optionButtons.length;
    optionButtons[nextIndex].focus();
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      <span className={LABEL_CLASS}>{t(label)}</span>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${triggerId}-menu`}
        onClick={onToggle}
        className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-left font-semibold outline-none transition-all sm:py-2.5 ${
          isOpen
            ? "border-purple-500/45 bg-white/8 shadow-[0_0_0_1px_rgba(168,85,247,0.08)]"
            : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8"
        }`}
      >
        <span className="min-w-0 truncate text-[15px] text-white">
          {t(selected.label)}
        </span>
        <ChevronUpDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${
            isOpen
              ? "text-purple-500"
              : "text-gray-500 group-hover:text-gray-400"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 origin-top transition-all duration-150">
          <div className="rounded-lg border border-white/6 bg-slate-950 p-1">
            <ul
              ref={menuRef}
              id={`${triggerId}-menu`}
              role="listbox"
              aria-labelledby={triggerId}
              className="max-h-64 space-y-1 overflow-y-auto overscroll-contain"
            >
              {options.map((option) => {
                const isSelected = option.value === selected.value;

                return (
                  <li key={option.value || "all"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onKeyDown={handleOptionKeyDown}
                      onClick={() => {
                        onChange(option.value);
                        onClose();
                        triggerRef.current?.focus();
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2 text-left text-[13px] font-semibold transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-white hover:bg-white/8"
                      }`}
                    >
                      <span className="truncate">{t(option.label)}</span>
                      <CheckIcon
                        className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const MoviesFilters = ({
  genres,
  genresLoading,
  genresError,
  hasActiveFilters,
  hasSearchQuery,
  minRating,
  onClearFilters,
  onGenreChange,
  onRatingChange,
  onRetryGenres,
  onSortChange,
  openSelect,
  selectedGenre,
  sortBy,
  toggleSelect,
  yearInput,
  setYearInput,
}) => {
  const { t } = useLanguage();
  return (
    <div className="relative z-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-400">
            {t("Discover filters")}
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-gray-400">
            {t("Find movies by genre, release year, rating, and sort order.")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="min-h-11 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-purple-500/40 hover:bg-purple-500/10"
        >
          {t("Reset filters")}
        </button>
      </div>

      {hasSearchQuery && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-100">
          {t(
            "Changing any filter will clear the current search and switch back to TMDB discover results.",
          )}
        </div>
      )}

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">
          {t("Genre")}
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 pr-1 scroll-smooth sm:pb-4">
          <button
            type="button"
            onClick={() => onGenreChange(null)}
            className={`${GENRE_BTN_BASE} ${
              selectedGenre === null
                ? "scale-105 border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            {t("All")}
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => onGenreChange(genre.id)}
              className={`${GENRE_BTN_BASE} ${
                selectedGenre === genre.id
                  ? "scale-105 border-purple-600 bg-purple-600 text-white shadow-xl shadow-purple-600/20"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {t(genre.name)}
            </button>
          ))}
        </div>
        {genresError && (
          <div
            role="alert"
            aria-busy={genresLoading}
            className="mt-2 flex flex-wrap items-center gap-3 text-sm text-red-300"
          >
            <span>{t("Could not load genres.")}</span>
            <button
              type="button"
              onClick={onRetryGenres}
              disabled={genresLoading}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-300/30 px-3 font-semibold text-white transition-colors hover:bg-red-300/10 disabled:cursor-wait disabled:opacity-70"
            >
              {genresLoading && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
                />
              )}
              {t("Try again")}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-2">
          <span className={LABEL_CLASS}>{t("Release Year")}</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder={t("e.g. 2024")}
            value={yearInput}
            onChange={(e) =>
              setYearInput(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className={INPUT_CLASS}
          />
        </label>

        <FilterSelect
          label="Minimum Rating"
          value={minRating}
          options={MIN_RATING_OPTIONS}
          isOpen={openSelect === "rating"}
          onToggle={() => toggleSelect("rating")}
          onClose={() => toggleSelect(null)}
          onChange={onRatingChange}
        />

        <FilterSelect
          label="Sort By"
          value={sortBy || DEFAULT_DISCOVER_SORT}
          options={DISCOVER_SORT_OPTIONS}
          isOpen={openSelect === "sort"}
          onToggle={() => toggleSelect("sort")}
          onClose={() => toggleSelect(null)}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
};

export default MoviesFilters;
