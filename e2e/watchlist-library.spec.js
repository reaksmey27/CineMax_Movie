import { selectFilter } from "./helpers/selectFilter.js";
import { expect, test } from "@playwright/test";

test("watchlist controls filter, sort, toggle and reset on mobile", async ({
  page,
}) => {
  // Exercise the real library with deterministic data; persistence is covered
  // separately by the Firestore emulator tests.
  await page.route("**/src/pages/watchlist/WatchlistPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
      import React from '/node_modules/.vite/deps/react.js';
      const { useState } = React;
      import WatchlistLibrary from '/src/pages/watchlist/WatchlistLibrary.jsx';
      export default function Fixture() {
        const [movies, setMovies] = useState([
          { id: 1, title: 'Zodiac', rating: '7.5', savedAt: '2026-01-01' },
          { id: 2, title: 'Alien', rating: '8.5', watched: true, savedAt: '2026-02-01' },
          { id: 3, title: 'Aliens', rating: '8.0', savedAt: '2026-03-01' }
        ]);
        return React.createElement('main', { style: { padding: '120px 16px 40px' } },
          React.createElement(WatchlistLibrary, { movies, isSaving: () => false,
            setWatched: (movie, watched) => setMovies(items => items.map(item => item.id === movie.id ? {...item, watched} : item))
          }));
      }
    `,
    }),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/watchlist");
  const library = page.getByRole("region", { name: "Saved movies" });
  await library.getByLabel("Search watchlist").fill("alien");
  await expect(library.locator("article")).toHaveCount(2);
  await selectFilter(library.getByLabel("Watch status"), "unwatched");
  await expect(library.locator("article")).toHaveCount(1);
  await library
    .getByRole("button", { name: "Watched: Aliens", exact: true })
    .click();
  await expect(
    library.getByText("No saved movies match your search or status."),
  ).toBeVisible();
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(library.locator("article")).toHaveCount(3);
  await selectFilter(library.getByLabel("Sort By"), "title");
  await expect(library.locator("article").first()).toContainText("Alien");
  await selectFilter(library.getByLabel("Watch status"), "watched");
  await expect(library.locator("article")).toHaveCount(2);
  await expect(
    library.getByRole("button", { name: "Watched: Aliens", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
