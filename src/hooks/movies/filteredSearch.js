// Search has no genre/rating/sort parameters. Combine its accessible pages
// before filtering so pagination never hides matches on a different page.
export async function filteredSearch(
  fetchPage,
  filters,
  isCancelled = () => false,
) {
  const first = await fetchPage(1);
  const pages = Math.min(first.total_pages || 0, 100);
  const results = [...(first.results || [])];
  for (let page = 2; page <= pages; page += 4) {
    if (isCancelled()) return null;
    const batch = await Promise.all(
      Array.from({ length: Math.min(4, pages - page + 1) }, (_, i) =>
        fetchPage(page + i),
      ),
    );
    for (const response of batch) results.push(...(response.results || []));
  }
  if (isCancelled()) return null;

  const unique = [
    ...new Map(results.map((movie) => [movie.id, movie])).values(),
  ];
  const matches = unique.filter(
    (movie) =>
      (!filters.selectedGenre ||
        movie.genre_ids?.includes(filters.selectedGenre)) &&
      (!filters.releaseYear ||
        movie.release_date?.startsWith(filters.releaseYear)) &&
      (!filters.minRating ||
        Number(movie.vote_average || 0) >= Number(filters.minRating)),
  );
  const sort = filters.sortBy;
  matches.sort((a, b) => {
    let comparison;
    if (sort === "original_title.asc") {
      comparison = (a.original_title || a.title || "").localeCompare(
        b.original_title || b.title || "",
      );
    } else if (sort?.startsWith("primary_release_date")) {
      // Unknown dates always belong at the end.
      if (!a.release_date || !b.release_date)
        return Number(!a.release_date) - Number(!b.release_date);
      comparison =
        a.release_date.localeCompare(b.release_date) *
        (sort.endsWith("asc") ? 1 : -1);
    } else {
      const field =
        sort === "vote_average.desc" ? "vote_average" : "popularity";
      comparison = Number(b[field] || 0) - Number(a[field] || 0);
    }
    return comparison || a.id - b.id;
  });
  const start = (filters.page - 1) * 20;
  return {
    results: matches.slice(start, start + 20),
    total_pages: Math.ceil(matches.length / 20),
  };
}
