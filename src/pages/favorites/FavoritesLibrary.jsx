import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import CollectionFilters from "../../components/movies/CollectionFilters";
import MovieGrid from "../../components/ui/MovieGrid";
import { getWatchlistView } from "../watchlist/watchlistView";

export default function FavoritesLibrary({ header, movies }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("saved");
  const visible = getWatchlistView(movies, query, "all", sort);
  const reset = () => {
    setQuery("");
    setSort("saved");
  };
  return (
    <section aria-label={t("Favorites")}>
      <CollectionFilters
        header={header}
        searchLabel={t("Search movies")}
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        total={movies.length}
        count={visible.length}
        reset={reset}
      />
      <MovieGrid movies={visible} />
    </section>
  );
}
