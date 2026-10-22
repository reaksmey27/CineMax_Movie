import { expect, test } from "@playwright/test";

test("favorites search, sorting and reset fit mobile and desktop", async ({
  page,
}) => {
  await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `import React from '/node_modules/.vite/deps/react.js';
      import FavoritesLibrary from '/src/pages/favorites/FavoritesLibrary.jsx';
      const movies = [
        { id: 1, title: 'Zodiac', rating: '7.5', savedAt: '2026-03-01' },
        { id: 2, title: 'Alien', rating: '8.5', savedAt: '2026-01-01' },
        { id: 3, title: 'Aliens', rating: '8.0', savedAt: '2026-02-01' }
      ];
      export default function Fixture() {
        return React.createElement('main', { style: { padding: '120px 16px 40px' } }, React.createElement(FavoritesLibrary, { movies }));
      }`,
    }),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/favorites");
  const library = page.getByRole("region", { name: "Favorites", exact: true });
  const search = library.getByRole("searchbox");
  await expect(search).toHaveAttribute("placeholder", "Search movies…");
  await expect(library.locator("article").first()).toContainText("Zodiac");
  await search.fill(" ALIEN ");
  await expect(library.locator("article")).toHaveCount(2);
  await expect(library.getByRole("status")).toHaveText("Showing 2 of 3 movies");
  await library.getByLabel("Sort By").selectOption("title");
  await expect(library.locator("article").first()).toContainText("Alien");
  await library.getByLabel("Sort By").selectOption("rating");
  await expect(library.locator("article").first()).toContainText("Alien");
  await search.fill("no matching movie");
  await expect(
    library.getByText("No Movies Found", { exact: true }),
  ).toBeVisible();
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(search).toHaveValue("");
  await expect(library.getByLabel("Sort By")).toHaveValue("saved");
  await expect(library.locator("article")).toHaveCount(3);
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
