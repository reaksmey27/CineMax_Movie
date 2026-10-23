import { expect, test } from "@playwright/test";

const movies = [
  { id: 101, title: "Example Movie", release_date: "2025-01-01", poster_path: "/broken.jpg", vote_average: 7.5 },
  { id: 102, title: "Example Sequel", release_date: "2026-01-01", poster_path: null, vote_average: 8 },
];

async function mockMovies(page, search) {
  await page.route("https://image.tmdb.org/**", route => route.abort());
  await page.route("https://api.themoviedb.org/**", route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/search/movie")) return search(route, url.searchParams.get("query"));
    const movie = movies.find(item => url.pathname.endsWith(`/movie/${item.id}`));
    return route.fulfill({ json: movie ? { ...movie, genres: [], credits: { cast: [], crew: [] }, videos: { results: [] } } : { results: [], genres: [], total_pages: 0 } });
  });
}

test("desktop suggestions support keyboard selection, poster fallback and composition", async ({ page }) => {
  await mockMovies(page, route => route.fulfill({ json: { results: movies } }));
  await page.goto("/privacy");
  const input = page.getByRole("combobox", { name: "Search movies", exact: true });
  await input.fill("example");
  const options = page.locator("#nav-live-search-results").getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(options.first().locator("img")).toHaveCount(0);
  await input.press("ArrowDown");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(page).toHaveURL(/\/privacy$/);
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/movie\/102$/);
  await expect(page.locator("#nav-live-search-results")).toHaveCount(0);
});

test("mobile search retries failures, shows empty results and opens a suggestion", async ({ page }) => {
  let fail = true;
  await mockMovies(page, (route, query) => fail
    ? route.fulfill({ status: 503, json: {} })
    : route.fulfill({ json: { results: query === "nothing" ? [] : movies } }));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Search movies", exact: true }).click();
  const input = page.getByRole("combobox", { name: "Search movies", exact: true });
  await input.fill("example");
  await expect(page.getByText("Live search is unavailable. Press Enter to try the results page.")).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("#nav-live-search-results").getByRole("option")).toHaveCount(2);
  await expect(input).toBeFocused();
  await input.fill("nothing");
  await expect(page.getByText("No results found for nothing", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.fill("example");
  await page.locator("#nav-live-search-results").getByRole("option").first().click();
  await expect(page).toHaveURL(/\/movie\/101$/);
});

test("late responses cannot replace newer suggestions and Escape dismisses", async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  let started = false;
  await mockMovies(page, async (route, query) => {
    if (query === "older") { started = true; await held; }
    return route.fulfill({ json: { results: query === "older" ? [movies[0]] : [movies[1]] } });
  });
  await page.goto("/privacy");
  const input = page.getByRole("combobox", { name: "Search movies", exact: true });
  await input.fill("older");
  await expect.poll(() => started).toBe(true);
  await input.fill("newer");
  await expect(page.getByRole("option")).toContainText("Example Sequel");
  const oldResponse = page.waitForResponse(response => new URL(response.url()).searchParams.get("query") === "older");
  release();
  await (await oldResponse).finished();
  await expect(page.getByRole("option")).toContainText("Example Sequel");
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
});
