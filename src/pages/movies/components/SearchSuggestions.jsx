import useSearchSuggestions from "../hooks/useSearchSuggestions";
import { useLanguage } from "../../../context/LanguageContext";

export default function SearchSuggestions({ query, onSearch }) {
  const { t } = useLanguage();
  const suggestions = useSearchSuggestions(query);

  if (!suggestions.length) return null;
  return (
    <section
      aria-label={t("Did you mean?")}
      className="mb-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 text-center"
      aria-live="polite"
    >
      <h2 className="mb-3 text-sm font-semibold text-purple-300">
        {t("Did you mean?")}
      </h2>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => onSearch(title)}
            className="min-h-11 max-w-full break-words rounded-xl border border-purple-400/30 px-4 py-2 text-sm text-white hover:bg-purple-500/20 focus-visible:outline-2 focus-visible:outline-purple-400"
          >
            {title}
          </button>
        ))}
      </div>
    </section>
  );
}
