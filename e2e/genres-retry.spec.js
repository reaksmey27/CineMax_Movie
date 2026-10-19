import { expect, test } from "@playwright/test";

test("genre filters can be retried after a failed request", async ({
  page,
}) => {
  let genreRequestCount = 0;

  await page.route("**/genre/movie/list**", async (route) => {
    genreRequestCount += 1;

    if (genreRequestCount === 1) {
      await route.fulfill({
        status: 500,
        json: { status_message: "Unavailable" },
      });
      return;
    }

    await route.fulfill({
      json: { genres: [{ id: 18, name: "Drama" }] },
    });
  });
  await page.route("**/discover/movie**", async (route) => {
    await route.fulfill({ json: { page: 1, results: [], total_pages: 1 } });
  });

  await page.goto("/movies");
  await expect(page.getByRole("alert")).toContainText("Could not load genres.");

  await page.getByRole("button", { name: "Try again" }).click();

  await expect(page.getByRole("button", { name: "Drama" })).toBeVisible();
  expect(genreRequestCount).toBe(2);
});
