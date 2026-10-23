import { test, expect } from "@playwright/test";

async function mockSearch(page, failSuggestions = false) {
  await page.route("https://api.themoviedb.org/**", route => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get("query");
    if (failSuggestions && (query === "bat" || url.pathname.endsWith("/popular"))) return route.abort();
    return route.fulfill({ json: {
      results: ["bat", "Batman"].includes(query) ? [{ id: 42, title: "Batman", release_date: "1989-01-01", genre_ids: [], vote_average: 7 }] : [],
      total_pages: query === "Batman" ? 1 : 0,
      genres: [],
    } });
  });
}

test("empty search suggests a close title and selecting it updates the search", async ({ page }) => {
  await mockSearch(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/movies?q=batamn");
  const suggestions = page.getByRole("region", { name: "Did you mean?" });
  await expect(suggestions).toBeVisible();
  await expect(page).toHaveURL(/q=batamn/);
  await suggestions.getByRole("button", { name: "Batman", exact: true }).click();
  await expect(page).toHaveURL(/q=Batman/);
  await expect(page.getByRole("heading", { name: "Batman", exact: true })).toBeVisible();
  await expect(suggestions).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("failed suggestions leave the original empty search usable", async ({ page }) => {
  await mockSearch(page, true);
  await page.goto("/movies?q=batamn");
  await expect(page.getByRole("heading", { name: "No Search Results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear Search", exact: true }).last()).toBeVisible();
  await expect(page).toHaveURL(/q=batamn/);
});
