import { expect, test } from "@playwright/test";

test("Back restores movie results, filters, page, and scroll position", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let requests = 0;
  await page.route("**/genre/movie/list**", (route) =>
    route.fulfill({ json: { genres: [] } }),
  );
  await page.route("**/discover/movie**", (route) => {
    requests++;
    return route.fulfill({
      json: {
        page: 2,
        total_pages: 3,
        results: Array.from({ length: 40 }, (_, index) => ({
          id: index + 1,
          title: `Movie ${index + 1}`,
          vote_average: 8,
          release_date: "2024-01-01",
        })),
      },
    });
  });
  await page.route("**/src/pages/movies/MovieDetailPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `import React from '/node_modules/.vite/deps/react.js'; export default function Detail() { return React.createElement('div', {style:{height:2000,paddingTop:150}}, 'Movie detail fixture'); }`,
    }),
  );
  const url = "/movies?page=2&year=2024&rating=7";
  await page.goto(url);
  const target = page.getByRole("link", { name: "Movie 25", exact: true });
  await target.scrollIntoViewIfNeeded();
  const previousY = await page.evaluate(() => window.scrollY);
  expect(previousY).toBeGreaterThan(500);
  await target.click();
  await expect(page).toHaveURL(/\/movie\/25$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(
    new RegExp("/movies\\?page=2&year=2024&rating=7$"),
  );
  await expect(target).toBeVisible();
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - previousY),
    )
    .toBeLessThan(3);
  expect(requests).toBe(1);
  await expect(page.getByLabel("Release Year")).toHaveValue("2024");
  await expect(page.locator("#filter-select-minimum-rating")).toHaveAttribute(
    "data-value",
    "7",
  );

  // Opening and closing a route-backed auth modal must not reset the background.
  await page
    .getByRole("link", { name: "Sign In", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - previousY),
    )
    .toBeLessThan(3);
});
