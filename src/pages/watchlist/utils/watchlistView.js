export function getWatchlistView(movies, query, status, sort) {
  const search = query.trim().toLocaleLowerCase();
  const result = movies.filter(
    (movie) =>
      (movie.title || "").toLocaleLowerCase().includes(search) &&
      (status === "all" || (movie.watched === true) === (status === "watched")),
  );
  return result.sort((a, b) => {
    if (sort === "title") return (a.title || "").localeCompare(b.title || "");
    if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
    return (Date.parse(b.savedAt) || 0) - (Date.parse(a.savedAt) || 0);
  });
}
