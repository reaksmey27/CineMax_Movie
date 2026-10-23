import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const sources = [
  "src/components/auth/SignOutDialog.jsx",
  "src/pages/not-found/NotFoundPage.jsx",
  "src/pages/movies/components/SearchSuggestions.jsx",
  "src/pages/notifications/components/NotificationsToolbar.jsx",
  "src/pages/movies/components/ActiveFilterChips.jsx",
  "src/components/auth/PasswordConfirmation.jsx",
  "src/components/auth/PasswordField.jsx",
  "src/pages/movies/components/PlaybackReport.jsx",
  "src/pages/movies/components/MovieFinishTime.jsx",
  "src/pages/history/ClearHistory.jsx",
  "src/context/RemovalUndoContext.jsx",
  "src/pages/auth/ResetPasswordPage.jsx",
  "src/components/movies/CollectionFilters.jsx",
  "src/pages/favorites/FavoritesLibrary.jsx",
  "src/pages/history/HistoryLibrary.jsx",
  "src/pages/history/HistoryPage.jsx",
  "src/components/movies/WatchHistoryList.jsx",
  "src/pages/auth/PasswordResetForm.jsx",
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
  "No trailer is available for this movie yet.",
  "At least one number or symbol",
  "At least one letter",
  "At least one capital letter",
  "At least one number",
  "Met",
  "Not met",
  "Password requirements",
  "At least 8 characters",
  "Lowercase letter (a-z)",
  "Uppercase letter (A-Z)",
  "Number (0-9)",
  "Symbol (e.g. !@#$)",
  "Meet all password requirements before continuing.",
  "Video won't load",
  "No sound",
  "Wrong movie",
  "Runtime",
  "Any runtime",
  "Under 90 minutes",
  "90–120 minutes",
  "Over 2 hours",
  "Share movie",
  "Share menu opened.",
  "Movie link copied.",
  "Could not share this movie. Try again.",
  "This reset link is invalid or expired. Request a new one.",
  "Could not reset your password. Please try again.",
  "Passwords do not match.",
  "Use a stronger password that meets your account requirements.",
  "Your progress is saved so you can continue watching later.",
  "This movie is saved in History. This server does not support exact-time resume.",
  "Forgot password?",
  "Too many reset attempts. Please wait and try again.",
  "Could not send the reset link. Please try again.",
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
    for (const [key, value] of Object.entries(messages)) {
      assert.doesNotMatch(
        value,
        /\?{2,}|\uFFFD/,
        `Corrupted translation in ${file}: ${key}`,
      );
      if (!key.includes("?") && !key.includes("？")) {
        assert.ok(
          !value.includes("?"),
          `Unexpected replacement question mark in ${file}: ${key}`,
        );
      }
    }
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
