import { expect, test } from "@playwright/test";

test("finish time shows runtime, uses local time across midnight, and hides unknown runtime", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-22T23:00:00") });
  await page.route("https://api.themoviedb.org/**", (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    return route.fulfill({
      json: {
        id,
        title: "Example Film",
        runtime: id === 42 ? 135 : 0,
        genres: [],
        videos: { results: [] },
        credits: { cast: [], crew: [] },
        results: [],
      },
    });
  });
  await page.goto("/movie/42");
  const estimate = page.getByTestId("movie-finish-time");
  await expect(estimate).toContainText("2 hr 15 min");
  const expected = await page.evaluate(() =>
    new Intl.DateTimeFormat("en", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(Date.now() + 135 * 60000)),
  );
  await expect(estimate).toContainText(`Estimated finish: ${expected}`);
  await page.goto("/movie/43");
  await expect(
    page.getByRole("heading", { name: "Example Film", exact: true }),
  ).toBeVisible();
  await expect(estimate).toHaveCount(0);
});
