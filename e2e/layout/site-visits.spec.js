import { expect, test } from "@playwright/test";

test("footer displays a public formatted visit count", async ({ page }) => {
  await page.route("**/src/firebase/siteVisits.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "export const loadSiteVisits = async () => 1234;",
    }),
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [], genres: [] } }),
  );
  await page.goto("/privacy");
  await expect(
    page.getByText("Website visits: 1,234", { exact: true }),
  ).toBeVisible();
});

test("unavailable counter does not invent a visit total", async ({ page }) => {
  await page.route("**/src/firebase/siteVisits.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "export const loadSiteVisits = async () => { throw Error('offline'); };",
    }),
  );
  await page.goto("/privacy");
  await expect(
    page.getByText("Website visits: —", { exact: true }),
  ).toBeVisible();
});
