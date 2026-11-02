import { expect, test } from "@playwright/test";

test("new movie query cannot select an old suggestion while loading", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("https://api.themoviedb.org/**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("query");
    if (query === "newer") await gate;
    await route.fulfill({
      json: {
        genres: [],
        total_pages: 1,
        results: query
          ? [
              {
                id: query === "older" ? 42 : 43,
                title: query === "older" ? "Old Suggestion" : "New Suggestion",
                genre_ids: [],
              },
            ]
          : [],
      },
    });
  });
  await page.goto("/movies");
  const input = page.locator(
    'main input[aria-controls="movie-live-search-results"]',
  );
  await input.fill("older");
  await expect(page.getByRole("option")).toContainText("Old Suggestion");
  await input.fill("newer");
  await input.press("ArrowDown");
  await expect(input).not.toHaveAttribute(
    "aria-activedescendant",
    /movie-live-result/,
  );
  await input.press("Enter");
  await expect(page).toHaveURL(/\/movies(?:\?|$)/);
  await expect(page.getByRole("option")).toHaveCount(0);
  release();
  await expect(page.getByRole("option")).toContainText("New Suggestion");
});

test("late movie search response cannot replace the current dropdown or grid", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let started = false;
  await page.route("https://api.themoviedb.org/**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("query");
    if (query === "older") {
      started = true;
      await gate;
    }
    await route.fulfill({
      json: {
        genres: [],
        total_pages: 1,
        results: query
          ? [
              {
                id: query === "older" ? 42 : 43,
                title: query === "older" ? "Old Suggestion" : "New Suggestion",
                genre_ids: [],
              },
            ]
          : [],
      },
    });
  });
  await page.goto("/movies");
  const input = page.locator(
    'main input[aria-controls="movie-live-search-results"]',
  );
  await input.fill("older");
  await expect.poll(() => started).toBe(true);
  await input.fill("newer");
  await expect(page.getByRole("option")).toContainText("New Suggestion");
  await expect(page.locator("article.movie-card")).toContainText(
    "New Suggestion",
  );
  const response = page.waitForResponse(
    (r) => new URL(r.url()).searchParams.get("query") === "older",
  );
  release();
  await (await response).finished();
  await expect(page.getByRole("option")).toContainText("New Suggestion");
  await expect(page.locator("article.movie-card")).toContainText(
    "New Suggestion",
  );
});
