import { XMarkIcon } from "@heroicons/react/24/outline";
import { DEFAULT_DISCOVER_SORT, DISCOVER_SORT_OPTIONS, RUNTIME_OPTIONS } from "../../../config/movieFilters";
import { useLanguage } from "../../../context/LanguageContext";

export default function ActiveFilterChips({ genres, selectedGenre, releaseYear, minRating, runtime, sortBy, onGenreChange, onYearChange, onRatingChange, onRuntimeChange, onSortChange }) {
  const { t } = useLanguage();
  const chips = [];
  if (selectedGenre !== null) {
    const genre = genres.find(item => item.id === selectedGenre);
    chips.push({ key: "genre", label: `${t("Genre")}: ${genre ? t(genre.name) : selectedGenre}`, remove: () => onGenreChange(null) });
  }
  if (releaseYear) chips.push({ key: "year", label: `${t("Release Year")}: ${releaseYear}`, remove: () => onYearChange("") });
  if (minRating) chips.push({ key: "rating", label: `${t("Minimum Rating")}: ${minRating}+`, remove: () => onRatingChange("") });
  const duration = RUNTIME_OPTIONS.find(item => item.value === runtime);
  if (runtime && duration) chips.push({ key: "runtime", label: t(duration.label), remove: () => onRuntimeChange("") });
  const sort = DISCOVER_SORT_OPTIONS.find(item => item.value === sortBy);
  if (sort && sortBy !== DEFAULT_DISCOVER_SORT) chips.push({ key: "sort", label: `${t("Sort By")}: ${t(sort.label)}`, remove: () => onSortChange(DEFAULT_DISCOVER_SORT) });
  if (!chips.length) return null;

  return (
    <div role="group" aria-label={t("Active filters")} className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <button
          key={chip.key}
          type="button"
          aria-label={t("Remove filter: {filter}", { filter: chip.label })}
          onClick={chip.remove}
          className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-2 text-left text-xs font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
        >
          <span className="min-w-0 break-words">{chip.label}</span>
          <XMarkIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      ))}
    </div>
  );
}
