import { expect, test } from "@playwright/test";

test("rating and sort filters support keyboard navigation and focus return", async ({
  page,
}) => {
  await page.route("**/genre/movie/list**", async (route) => {
    await route.fulfill({
      json: { genres: [{ id: 18, name: "Drama" }] },
    });
  });
  await page.route("**/discover/movie**", async (route) => {
    await route.fulfill({ json: { page: 1, results: [], total_pages: 1 } });
  });

  await page.goto("/movies");

  const ratingTrigger = page.locator("#filter-select-minimum-rating");
  await ratingTrigger.click();
  await expect(page.getByRole("option", { name: "Any Rating" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const ratingFiveOption = page.getByRole("option", { name: "5.0+" });
  await expect(ratingFiveOption).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "6.0+" })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(ratingFiveOption).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(ratingTrigger).toHaveText("5.0+");
  await expect(ratingTrigger).toBeFocused();

  await ratingTrigger.click();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "6.0+" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(ratingTrigger).toHaveText("6.0+");
  await expect(ratingTrigger).toBeFocused();

  const sortTrigger = page.locator("#filter-select-sort-by");
  await sortTrigger.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("option", { name: "Popularity" })).toBeFocused();
  await page.keyboard.press("End");
  const lastSortOption = page.getByRole("option", { name: "Title A-Z" });
  await expect(lastSortOption).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sortTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(sortTrigger).toBeFocused();
});
