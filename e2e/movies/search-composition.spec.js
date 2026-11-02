import { expect, test } from "@playwright/test";

for (const place of ["navbar", "movies"]) {
  test(`${place} searches only after text composition finishes`, async ({
    page,
  }) => {
    const queries = [];
    await page.route("https://api.themoviedb.org/**", (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("query");
      if (query) queries.push(query);
      return route.fulfill({
        json: {
          genres: [],
          total_pages: 1,
          results: query
            ? [{ id: 42, title: "Completed Search", genre_ids: [] }]
            : [],
        },
      });
    });
    const path = place === "navbar" ? "/privacy" : "/movies";
    await page.goto(path);
    const input =
      place === "navbar"
        ? page.getByRole("combobox", { name: "Search movies", exact: true })
        : page.locator('main input[aria-controls="movie-live-search-results"]');
    await input.focus();
    await input.dispatchEvent("compositionstart");
    await input.fill("\u6620\u753b");
    await input.dispatchEvent("keydown", {
      key: "Enter",
      isComposing: true,
      keyCode: 229,
    });
    // Wait beyond both debounce intervals to prove intermediate text is not sent.
    await page.waitForTimeout(1000);
    expect(queries).toEqual([]);
    await expect(page).toHaveURL(new RegExp(path + "$"));
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await input.dispatchEvent("compositionend", { data: "\u6620\u753b" });
    await expect(page.getByRole("option")).toContainText("Completed Search");
    expect(queries.every((query) => query === "\u6620\u753b")).toBe(true);
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/movie\/42$/);
  });
}
