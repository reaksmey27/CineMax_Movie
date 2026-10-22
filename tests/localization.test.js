import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const sources = [
  "src/components/layout/LanguageSelector.jsx",
  "src/pages/watchlist/WatchlistLibrary.jsx",
  "src/pages/watchlist/WatchlistPage.jsx",
  "src/pages/movies/components/MovieCredits.jsx",
  "src/pages/movies/components/RelatedMovies.jsx",
  "src/pages/movies/components/MoviesFilters.jsx",
  "src/pages/profile/components/ProBanner.jsx",
  "src/pages/profile/components/ProfileCollection.jsx",
  "src/pages/profile/components/ProfileForm.jsx",
  "src/pages/profile/ProfilePage.jsx",
  "src/components/ui/MovieCard.jsx",
];
const keys = new Set([
  "Your next movie is waiting",
  "Make room for your favorites",
  "Save movies you want to watch and find them here whenever you are ready.",
  "Tap the heart on a movie you love to start your personal collection.",
  "Find your next movie, organize saved titles, and keep track of what you've watched.",
  "This movie is no longer in your watchlist.",
  "We couldn't update watched status. Please try again.",
]);
for (const source of sources) {
  const content = await readFile(
    new URL(`../${source}`, import.meta.url),
    "utf8",
  );
  for (const match of content.matchAll(/\bt\(\s*"([^"\n]+)"/g))
    keys.add(match[1]);
}
const placeholders = (text) =>
  [...new Set(text.match(/\{\w+\}/g) || [])].sort();
for (const file of await readdir(
  new URL("../src/i18n/locales/", import.meta.url),
)) {
  if (file === "en.js" || !file.endsWith(".js")) continue;
  test(`${file} covers watchlist, detail and profile messages without losing placeholders`, async () => {
    const messages = (await import(`../src/i18n/locales/${file}`)).default;
    for (const key of keys) {
      assert.ok(messages[key]?.trim(), `Missing translation: ${key}`);
      assert.deepEqual(
        placeholders(messages[key]),
        placeholders(key),
        `Invalid placeholders: ${key}`,
      );
    }
  });
}
