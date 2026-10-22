import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Asia/Bangkok" });
const movies = [
  { id: 1, title: "Already Released", release_date: "2026-10-21" },
  { id: 2, title: "Released Today", release_date: "2026-10-22" },
  { id: 3, title: "Tomorrow Release", release_date: "2026-10-23" },
  { id: 4, title: "Unknown Date", release_date: "" },
  { id: 5, title: "Invalid Date", release_date: "2027-02-30" },
];

test("upcoming page and homepage exclude released titles even if the API returns them", async ({
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
  await page.goto("/");
  const upcoming = page.getByRole("region", { name: "Upcoming", exact: true });
  await expect(upcoming.locator("article.movie-card")).toHaveCount(1);
  await expect(
    upcoming.getByRole("link", { name: "Tomorrow Release", exact: true }),
  ).toBeVisible();
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
