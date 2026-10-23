import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";
import { rankMovieSuggestions, suggestionQueries } from "../../../utils/movieSearchSuggestions";
import { useLanguage } from "../../../context/LanguageContext";

export default function SearchSuggestions({ query, onSearch }) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let active = true;
    const queries = suggestionQueries(query);
    if (!queries.length) return undefined;
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled([
        tmdbService.getPopularMovies(),
        ...queries.map(async (part) => (await tmdbService.searchMovies(part))?.results || []),
      ]);
      if (active) setSuggestions(rankMovieSuggestions(query,
        results.flatMap((result) => result.status === "fulfilled" ? result.value : [])));
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  if (!suggestions.length) return null;
  return (
    <section aria-label={t("Did you mean?")} className="mb-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 text-center" aria-live="polite">
      <h2 className="mb-3 text-sm font-semibold text-purple-300">{t("Did you mean?")}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((title) => (
          <button key={title} type="button" onClick={() => onSearch(title)}
            className="min-h-11 max-w-full break-words rounded-xl border border-purple-400/30 px-4 py-2 text-sm text-white hover:bg-purple-500/20 focus-visible:outline-2 focus-visible:outline-purple-400">
            {title}
          </button>
        ))}
      </div>
    </section>
  );
}
