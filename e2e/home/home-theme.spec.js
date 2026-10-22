import { expect, test } from "@playwright/test";

test("featured hero controls stay readable in light theme", async ({
  page,
}) => {
  await page.route("**/3/**", async (route) => {
    const url = new URL(route.request().url());
    const results = url.pathname.endsWith("/trending/movie/day")
      ? [
          {
            id: 42,
            title: "Theme Contrast Test",
            release_date: "2026-01-01",
            overview: "A movie used to verify hero text contrast.",
            vote_average: 8,
            genre_ids: [28],
          },
        ]
      : [];

    await route.fulfill({
      json: { page: 1, results, total_pages: 1 },
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode" }).click();

  const movieTitle = page.locator(".hero-carousel h2");
  await expect(movieTitle).toContainText("Theme Contrast Test");
  await expect(movieTitle).toHaveCSS("color", "rgb(248, 250, 252)");

  const previousButton = page.getByRole("button", {
    name: "Previous featured movie",
  });
  await expect(previousButton).toHaveCSS("color", "rgb(51, 65, 85)");
  await expect(previousButton).toHaveCSS(
    "background-color",
    "rgba(248, 250, 252, 0.96)",
  );

  const genreChip = page.locator(".hero-genre-chip");
  await expect(genreChip).toHaveCSS("color", "rgb(51, 65, 85)");
  await expect(genreChip).toHaveCSS(
    "background-color",
    "rgba(248, 250, 252, 0.94)",
  );

  const favoriteButton = page.locator(".hero-favorite");
  await expect(favoriteButton).toHaveCSS("color", "rgb(51, 65, 85)");
  await expect(favoriteButton).toHaveCSS(
    "background-color",
    "rgba(248, 250, 252, 0.96)",
  );
});
