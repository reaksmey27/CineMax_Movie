export function getViewingStats(history) {
  const completed = history.filter((movie) => movie.completed === true);
  let minutes = 0;
  const counts = new Map();
  for (const movie of completed) {
    if (Number.isFinite(movie.runtimeMinutes) && movie.runtimeMinutes > 0) {
      minutes += movie.runtimeMinutes;
    } else if (
      Number.isFinite(movie.durationSeconds) &&
      movie.durationSeconds > 0
    ) {
      minutes += movie.durationSeconds / 60;
    }
    for (const genre of new Set(
      Array.isArray(movie.genres) ? movie.genres : [],
    )) {
      if (typeof genre === "string" && genre.trim()) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      }
    }
  }
  return {
    watched: completed.length,
    hours: minutes / 60,
    genres: [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3),
  };
}
