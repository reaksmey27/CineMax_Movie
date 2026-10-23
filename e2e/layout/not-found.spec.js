import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", route => route.fulfill({
    json: { results: [], genres: [], total_pages: 0 },
  }));
});

test("direct broken link offers a safe back fallback and catalog link", async ({ page }) => {
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page).toHaveTitle("Page not found | CineMax");
  await expect(page.getByRole("link", { name: "Browse Movies", exact: true })).toHaveAttribute("href", "/movies");
  await page.getByRole("button", { name: "Go Back", exact: true }).click();
  await expect(page).toHaveURL(/\/movies$/);
});

test("back returns to the previous in-app route", async ({ page }) => {
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Notifications", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const idx = window.history.state.idx;
    window.history.pushState({ idx: idx + 1, key: "missing-route" }, "", "/missing-page");
    window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  });
  await page.getByRole("button", { name: "Go Back", exact: true }).click();
  await expect(page).toHaveURL(/\/notifications$/);
});

test("Khmer 404 fits a narrow screen and supports light theme", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cinemax_language", "km");
    localStorage.setItem("cinemax-theme", "light");
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "រកមិនឃើញទំព័រទេ" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/theme-light/);
  const card = page.getByRole("region", { name: "រកមិនឃើញទំព័រទេ" });
  await expect(card.getByRole("button")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await card.getByRole("link").click();
  await expect(page).toHaveURL(/\/movies$/);
});
