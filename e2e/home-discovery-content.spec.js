import { expect, test } from "@playwright/test";

test("homepage starts with enough movie discovery content", async ({
  page,
}) => {
  const results = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    title: `Movie Story ${index + 1}`,
    release_date: "2025-01-01",
    overview: "A movie used to verify homepage collections.",
    vote_average: 7.5,
    genre_ids: [18],
  }));

  await page.route("**/3/**", async (route) => {
    const upcoming = new URL(route.request().url()).searchParams.get(
      "primary_release_date.gte",
    );
    await route.fulfill({
      json: {
        page: 1,
        results: upcoming
          ? results.map((movie) => ({ ...movie, release_date: upcoming }))
          : results,
        total_pages: 1,
      },
    });
  });

  await page.goto("/");
  await expect(page.locator("#home article.movie-card")).toHaveCount(300);

  const wordCount = await page
    .locator("#home")
    .innerText()
    .then((text) => text.trim().split(/\s+/).filter(Boolean).length);
  expect(wordCount).toBeGreaterThanOrEqual(500);
});
