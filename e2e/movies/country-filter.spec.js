import { expect, test } from "@playwright/test";

test("country filter combines with other filters, persists and clears without excluding Thai movies globally", async ({
  page,
}) => {
  const requests = [];
  await page.route("https://api.themoviedb.org/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/genre/movie/list"))
      return route.fulfill({ json: { genres: [{ id: 18, name: "Drama" }] } });
    if (url.pathname.endsWith("/discover/movie")) {
      requests.push(Object.fromEntries(url.searchParams));
      return route.fulfill({ json: { results: [], total_pages: 0 } });
    }
    if (url.pathname.endsWith("/search/movie"))
      return route.fulfill({
        json: {
          results: [
            {
              id: 42,
              title: "Cambodian Film",
              genre_ids: [18],
              vote_average: 8,
              release_date: "2025-01-01",
            },
            {
              id: 43,
              title: "Thai Film",
              genre_ids: [18],
              vote_average: 8,
              release_date: "2025-01-01",
            },
          ],
          total_pages: 1,
        },
      });
    if (/\/movie\/(42|43)$/.test(url.pathname))
      return route.fulfill({
        json: { origin_country: [url.pathname.endsWith("42") ? "KH" : "TH"] },
      });
    return route.fulfill({ json: { results: [] } });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/movies?genre=18&year=2025&rating=7");
  const country = page.locator("#filter-select-country");
  await country.click();
  const search = page.getByRole("searchbox", { name: "Search countries..." });
  await expect(search).toBeFocused();
  await search.fill("Thai");
  await expect(
    page.getByText("No countries found", { exact: true }),
  ).toBeVisible();
  await search.fill("cAmBo");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(
    page.getByRole("option", { name: "Thailand", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("option", { name: "Cambodia", exact: true }).click();
  await expect(page).toHaveURL(/country=KH/);
  await expect.poll(() => requests.at(-1)?.with_origin_country).toBe("KH");
  expect(requests.at(-1)).toMatchObject({
    with_genres: "18",
    primary_release_year: "2025",
    "vote_average.gte": "7",
  });
  await page.reload();
  await expect(country).toContainText("Cambodia");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/movies?q=Film&country=KH");
  await expect(
    page.getByRole("link", { name: "Cambodian Film", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Thai Film", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Remove filter: Country: Cambodia",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("link", { name: "Thai Film", exact: true }),
  ).toBeVisible();
  await country.click();
  await expect(search).toHaveValue("");
  await search.fill("KH");
  await search.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Cambodia", exact: true }),
  ).toBeFocused();
  await page.getByRole("option", { name: "Cambodia", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear all filters", exact: true })
    .click();
  await expect(page).not.toHaveURL(/country=/);
  await expect(page).toHaveURL(/q=Film/);
});
