import { expect, test } from "@playwright/test";

test("release year searches, clears, selects by keyboard and persists on mobile", async ({
  page,
}) => {
  const requests = [];
  await page.route("https://api.themoviedb.org/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/discover/movie"))
      requests.push(Object.fromEntries(url.searchParams));
    return route.fulfill({ json: { genres: [], results: [], total_pages: 0 } });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/movies?country=KH&rating=7&page=3");
  const year = page.getByRole("button", { name: "Release Year", exact: true });
  await year.click();
  const search = page.getByRole("searchbox", { name: "Search years..." });
  await expect(search).toBeFocused();
  await expect(page.getByRole("option").first()).toHaveText("All years");
  await search.fill("not a year");
  await expect(page.getByText("No years found", { exact: true })).toBeVisible();
  await page
    .locator("#filter-select-release-year")
    .locator("..")
    .getByRole("button", { name: "Clear search", exact: true })
    .click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await search.fill("2025");
  await expect(page.getByRole("option")).toHaveCount(1);
  await search.press("Enter");
  await expect(year).toBeFocused();
  await expect(page).toHaveURL(/year=2025/);
  await expect.poll(() => requests.at(-1)?.primary_release_year).toBe("2025");
  expect(requests.at(-1)).toMatchObject({
    page: "1",
    with_origin_country: "KH",
    "vote_average.gte": "7",
  });
  await page.reload();
  await expect(year).toContainText("2025");
  await year.click();
  await page.getByRole("option", { name: "All years", exact: true }).click();
  await expect(page).not.toHaveURL(/year=/);
  await expect(page).toHaveURL(/country=KH/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
