import CollectionState from "../../components/movies/CollectionState";
import useCollectionFilters from "../../hooks/useCollectionFilters";
import { useLanguage } from "../../context/LanguageContext";
import CollectionFilters from "../../components/movies/CollectionFilters";
import MovieGrid from "../../components/ui/MovieGrid";
import { getWatchlistView } from "../watchlist/watchlistView";

export default function FavoritesLibrary({ header, movies }) {
  const { t } = useLanguage();
  const { query, setQuery, sort, setSort, reset } =
    useCollectionFilters("favorites");
  const visible = getWatchlistView(movies, query, "all", sort);
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
      {visible.length ? (
        <MovieGrid movies={visible} />
      ) : (
        <CollectionState
          title={t("No Movies Found")}
          message={t(
            "Try adjusting your search or filters to explore more titles.",
          )}
        />
      )}
    </section>
  );
}
