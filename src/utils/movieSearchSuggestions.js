const normalize = (text) => text.normalize("NFKC").toLowerCase()
  .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ").trim();

// Edit distance including swapped neighboring letters (e.g. "batamn").
function distance(first, second) {
  const a = Array.from(first);
  const b = Array.from(second);
  const rows = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length];
}

export function suggestionQueries(query) {
  const value = normalize(query);
  if (value.length < 4 || value.length > 80) return [];
  const words = value.split(" ");
  return [...new Set([words[0].slice(0, Math.max(3, Math.floor(words[0].length / 2))),
    words.length > 1 ? words.at(-1) : ""])]
    .filter((part) => part.length >= 3 && part !== value).slice(0, 2);
}

export function rankMovieSuggestions(query, movies) {
  const value = normalize(query);
  if (value.length < 4 || value.length > 80) return [];
  const candidates = new Map();
  for (const movie of movies) {
    if (movie.adult || typeof movie.title !== "string") continue;
    const title = normalize(movie.title);
    if (!title || title === value || title.length > 100) continue;
    const score = distance(value, title);
    const allowed = Math.min(3, Math.max(1, Math.floor(value.length / 4)));
    if (score <= allowed && !candidates.has(title)) candidates.set(title, { title: movie.title, score });
  }
  return [...candidates.values()].sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
    .slice(0, 3).map(({ title }) => title);
}
