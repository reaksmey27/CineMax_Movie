import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("movie badges follow completed history and disappear for unfinished or failed history", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.route("https://api.themoviedb.org/3/genre/movie/list**", (route) =>
    route.fulfill({ json: { genres: [] } }),
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("https://api.themoviedb.org/3/discover/movie**", (route) =>
    route.fulfill({
      json: {
        page: 1,
        total_pages: 1,
        results: [
          { id: 42, title: "Finished Film", vote_average: 7, genre_ids: [] },
          { id: 43, title: "Unfinished Film", vote_average: 7, genre_ids: [] },
        ],
      },
    }),
  );
  await page.addInitScript(() =>
    localStorage.setItem(
      "history-fan",
      JSON.stringify([{ id: 42, completed: true }]),
    ),
  );
  await page.goto("/movies");
  const badge = page.getByLabel("Watched: Finished Film", { exact: true });
  await expect(badge).toBeVisible();
  await expect(
    page.getByLabel("Watched: Unfinished Film", { exact: true }),
  ).toHaveCount(0);
  const card = page.locator("article.movie-card").filter({ has: badge });
  const size = await card.boundingBox();
  await card.getByRole("button", { name: "Mark as unfinished" }).click();
  await expect(badge).toHaveCount(0);
  const firstCard = page
    .locator("article.movie-card")
    .filter({
      has: page.getByRole("link", { name: "View Finished Film", exact: true }),
    });
  await page.evaluate(() => localStorage.setItem("fail-status", "1"));
  await firstCard.getByRole("button", { name: "Mark as watched" }).click();
  await expect(firstCard.getByRole("alert")).toHaveText(
    "Could not save watch history.",
  );
  await expect(badge).toHaveCount(0);
  await page.evaluate(() => localStorage.removeItem("fail-status"));
  await firstCard.getByRole("button", { name: "Mark as watched" }).click();
  await expect(badge).toBeVisible();
  await expect(firstCard.getByRole("alert")).toHaveCount(0);
  const secondCard = page
    .locator("article.movie-card")
    .filter({
      has: page.getByRole("link", {
        name: "View Unfinished Film",
        exact: true,
      }),
    });
  await secondCard.getByRole("button", { name: "Mark as watched" }).click();
  await expect(
    page.getByLabel("Watched: Unfinished Film", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem(
      "history-fan",
      JSON.stringify([{ id: 42, completed: false }]),
    );
    window.dispatchEvent(new Event("history-refresh"));
  });
  await expect(badge).toHaveCount(0);
  await page.evaluate(() => {
    localStorage.setItem(
      "history-fan",
      JSON.stringify([{ id: 42, completed: true }]),
    );
    window.dispatchEvent(new Event("history-refresh"));
  });
  await expect(badge).toBeVisible();
  expect((await card.boundingBox()).height).toBe(size.height);
  await page.evaluate(() => {
    localStorage.setItem("fail-read", "1");
    window.dispatchEvent(new Event("history-refresh"));
  });
  await expect(badge).toHaveCount(0);
  await page
    .getByRole("link", { name: "View Finished Film", exact: true })
    .click();
  await expect(page).toHaveURL(/\/movie\/42$/);
});
