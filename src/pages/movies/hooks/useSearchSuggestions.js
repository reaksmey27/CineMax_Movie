import { useEffect, useState } from "react";
import { tmdbService } from "../../../services/tmdbService";
import {
  rankMovieSuggestions,
  suggestionQueries,
} from "../../../utils/movieSearchSuggestions";

export default function useSearchSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let active = true;
    const queries = suggestionQueries(query);
    if (!queries.length) return undefined;
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled([
        tmdbService.getPopularMovies(),
        ...queries.map(
          async (part) => (await tmdbService.searchMovies(part))?.results || [],
        ),
      ]);
      if (active)
        setSuggestions(
          rankMovieSuggestions(
            query,
            results.flatMap((result) =>
              result.status === "fulfilled" ? result.value : [],
            ),
          ),
        );
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return suggestions;
}
