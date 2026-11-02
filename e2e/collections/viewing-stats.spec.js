import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("profile statistics handle loading, retry, completed movies and narrow screens", async ({ page }) => {
  await setupPlaybackHistory(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/src/firebase/watchHistory.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `let attempts = 0;
      export function subscribeWatchHistory(db, uid, success, error) {
        const attempt = ++attempts;
        const timer = setTimeout(() => attempt === 1 ? error() : success([
          {id:1, completed:true, runtimeMinutes:120, genres:['Drama']},
          {id:2, completed:true, durationSeconds:3600, genres:['Drama','Action']},
          {id:3, completed:false, runtimeMinutes:200, genres:['Comedy']}
        ]), 800);
        return () => clearTimeout(timer);
      }`,
  }));
  await page.goto("/profile");
  const stats = page.getByRole("region", { name: "Viewing statistics" });
  await expect(stats.locator('[aria-busy="true"]')).toBeVisible();
  await expect(stats.getByText("Could not load watch history.")).toBeVisible();
  await stats.getByRole("button", { name: "Try again" }).click();
  await expect(stats.locator("dd").nth(0)).toHaveText("2");
  await expect(stats.locator("dd").nth(1)).toHaveText("3");
  await expect(stats.getByText("Drama · 2", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
