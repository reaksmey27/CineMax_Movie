import { useFavorites } from "../../context/FavoritesContext";
import { useWatchlist } from "../../context/WatchlistContext";

export default function useMovieCollectionActions(movie) {
  const { toggleFavorite, isFavorite, isSavingFavorite } = useFavorites();
  const { toggleWatchlist, isInWatchlist, isSavingToWatchlist } =
    useWatchlist();

  return {
    isFav: movie ? isFavorite(movie.id) : false,
    isWatchlisted: movie ? isInWatchlist(movie.id) : false,
    favoritePending: movie ? isSavingFavorite(movie.id) : false,
    watchlistPending: movie ? isSavingToWatchlist(movie.id) : false,
    onFavorite: () => {
      if (movie) toggleFavorite(movie);
    },
    onWatchlist: () => {
      if (movie) toggleWatchlist(movie);
    },
  };
}
