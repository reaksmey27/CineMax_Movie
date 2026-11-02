import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Asia/Bangkok" });
const movies = [
  { id: 1, title: "Already Released", release_date: "2026-10-21" },
  { id: 2, title: "Released Today", release_date: "2026-10-22" },
  { id: 3, title: "Tomorrow Release", release_date: "2026-10-23" },
  { id: 4, title: "Unknown Date", release_date: "" },
  { id: 5, title: "Invalid Date", release_date: "2027-02-30" },
];

test("upcoming page excludes released titles even if the API returns them", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-21T18:00:00Z"));
  const upcomingRequests = [];
  await page.route("https://api.themoviedb.org/**", (route) => {
    const url = new URL(route.request().url());
    const date = url.searchParams.get("primary_release_date.gte");
    if (date) upcomingRequests.push(date);
    return route.fulfill({ json: { results: movies, total_pages: 1 } });
  });
  await page.goto("/upcoming");
  await expect(page.locator("article.movie-card")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Tomorrow Release", exact: true }),
  ).toBeVisible();
  await expect(page.locator('time[datetime="2026-10-23"]')).toHaveText(
    "Oct 23, 2026",
  );
  expect(upcomingRequests).toContain("2026-10-23");
});

test("an upcoming response with no future dates shows an empty state", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-22T10:00:00+07:00"));
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({
      json: { results: movies.filter((movie) => movie.id !== 3) },
    }),
  );
  await page.goto("/upcoming");
  await expect(
    page.getByRole("heading", { name: "No Movies Found" }),
  ).toBeVisible();
  await expect(page.locator("article.movie-card")).toHaveCount(0);
});

for (const release of [
  { date: "2026-10-23", upcoming: true },
  { date: "2026-10-22", upcoming: false },
  { date: "", upcoming: false },
  { date: "2027-02-30", upcoming: false },
]) {
  test(`featured and detail actions match release date ${release.date || "unknown"}`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-10-21T18:00:00Z"));
    const movie = {
      id: 42,
      title: "Release Status Film",
      release_date: release.date,
      genres: [],
      genre_ids: [],
      credits: {},
      videos: {
        results: [{ site: "YouTube", type: "Trailer", key: "trailer-test" }],
      },
    };
    await page.route("https://api.themoviedb.org/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      return route.fulfill({
        json: path.endsWith("/movie/42")
          ? movie
          : {
              results: path.endsWith("/recommendations") ? [] : [movie],
              total_pages: 1,
            },
      });
    });
    await page.goto("/");
    const hero = page.getByRole("region", {
      name: "Featured movies",
      exact: true,
    });
    const action = hero.getByRole("link", {
      name: release.upcoming ? "Upcoming" : "Watch now",
      exact: true,
    });
    await expect(action).toBeVisible();
    await action.click();
    await expect(
      page.getByRole("heading", { name: movie.title, level: 1 }),
    ).toBeVisible();
    if (release.upcoming) {
      await expect(
        page.getByRole("button", { name: "Upcoming", exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Watch Trailer", exact: true }),
      ).toBeEnabled();
      await expect(page.locator("iframe")).toHaveCount(0);
    } else {
      await expect(
        page.getByRole("button", { name: "Log in to Watch", exact: true }),
      ).toBeEnabled();
    }
  });
}
