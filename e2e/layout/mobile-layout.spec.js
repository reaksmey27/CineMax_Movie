import { test, expect } from "@playwright/test";

for (const width of [320, 375, 768]) {
  test(`pages fit ${width}px with usable touch controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/3/**", (route) =>
      route.fulfill({
        json: {
          page: 1,
          total_pages: 5,
          genres: [
            { id: 18, name: "Drama" },
            { id: 28, name: "Action" },
          ],
          results: Array.from({ length: 4 }, (_, i) => ({
            id: i + 1,
            title: "A Very Long Movie Title for Small Screens",
            overview: "A movie story.",
            release_date: "2026-01-01",
            vote_average: 7.5,
            genre_ids: [18],
          })),
        },
      }),
    );
    for (const path of [
      "/",
      "/movies",
      "/trending",
      "/upcoming",
      "/favorites",
      "/watchlist",
      "/history",
      "/login",
      "/signup",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeAttached();
      if (path === "/") {
        await expect(
          page.getByRole("button", { name: "Show featured movie 4" }),
        ).toBeVisible();
      } else if (path === "/movies") {
        await expect(
          page.getByRole("button", { name: "Drama", exact: true }),
        ).toBeVisible();
      } else if (path === "/login" || path === "/signup") {
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
      }
      const result = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        small: [...document.querySelectorAll("button,input")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && r.height < 44;
          })
          .map((e) => ({
            text: (e.getAttribute("aria-label") || e.textContent || e.name)
              .trim()
              .slice(0, 45),
            height: Math.round(e.getBoundingClientRect().height),
          }))
          .slice(0, 18),
      }));
      expect(result.width, `${path} must fit the viewport`).toBeLessThanOrEqual(
        width,
      );
      expect(
        result.small,
        `${path} controls need at least 44px height`,
      ).toEqual([]);
      if (path === "/") {
        const menu = page.getByRole("button", {
          name: "Open menu",
          exact: true,
        });
        const box = await menu.boundingBox();
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        await page.screenshot({
          path: `test-results/mobile-home-${width}.png`,
        });
      }
    }
  });
}
