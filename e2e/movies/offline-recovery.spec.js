import { test, expect } from "@playwright/test";

test("offline browsing keeps loaded cards and retries without reloading", async ({
  page,
  context,
}) => {
  await page.route("https://api.themoviedb.org/**", (route) => {
    const url = new URL(route.request().url());
    const title =
      url.searchParams.get("query") === "second" ? "Second Film" : "First Film";
    return route.fulfill({
      json: {
        genres: [],
        total_pages: 1,
        results: [
          {
            id: title === "First Film" ? 42 : 43,
            title,
            genre_ids: [],
            vote_average: 7,
          },
        ],
      },
    });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/movies?q=first");
  await expect(
    page.getByRole("heading", { name: "First Film", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.offlineTestMarker = "same-document";
  });
  await context.setOffline(true);
  const banner = page.getByRole("complementary", { name: "Connection status" });
  await expect(banner).toContainText("You're offline.");
  await page
    .locator('main input[aria-controls="movie-live-search-results"]')
    .fill("second");
  await page
    .locator('main input[aria-controls="movie-live-search-results"]')
    .blur();
  await expect(page.getByRole("alert")).toContainText(
    "Showing previously loaded movies.",
  );
  await expect(
    page.getByRole("heading", { name: "First Film", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(banner).toContainText("Connection restored.");
  await page
    .getByRole("alert")
    .getByRole("button", { name: "Try again" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Second Film", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "First Film", exact: true }),
  ).toHaveCount(0);
  expect(await page.evaluate(() => window.offlineTestMarker)).toBe(
    "same-document",
  );
  await banner.getByRole("button", { name: "Dismiss" }).click();
  await expect(banner).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("initial movie request failure retries in place", async ({ page }) => {
  let failed = true;
  await page.route("https://api.themoviedb.org/**", (route) => {
    if (failed && route.request().url().includes("/search/movie"))
      return route.fulfill({ status: 503, json: {} });
    return route.fulfill({
      json: {
        genres: [],
        total_pages: 1,
        results: [{ id: 42, title: "Recovered Film", genre_ids: [] }],
      },
    });
  });
  await page.goto("/movies?q=recover");
  await expect(
    page.getByRole("button", { name: "Retry Connection" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.offlineTestMarker = true;
  });
  failed = false;
  await page.getByRole("button", { name: "Retry Connection" }).click();
  await expect(
    page.getByRole("heading", { name: "Recovered Film", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.offlineTestMarker)).toBe(true);
});
