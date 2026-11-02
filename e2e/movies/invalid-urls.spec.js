import { expect, test } from "@playwright/test";

test("malformed movie IDs never request details and allow browsing", async ({
  page,
}) => {
  const requested = [];
  await page.route("https://api.themoviedb.org/**", (route) => {
    requested.push(new URL(route.request().url()).pathname);
    return route.fulfill({ json: { results: [], genres: [], total_pages: 1 } });
  });
  for (const id of [
    "abc",
    "-1",
    "0",
    "42junk",
    "1.5",
    "9007199254740992",
    "42%2Fcredits",
  ]) {
    await page.goto("/movie/" + id);
    await expect(
      page.getByText("Movie not found", { exact: true }),
    ).toBeVisible();
    expect(requested.filter((path) => path.startsWith("/3/movie/"))).toEqual(
      [],
    );
  }
  await page
    .getByRole("button", { name: "Browse Movies", exact: true })
    .click();
  await expect(page).toHaveURL(/\/movies$/);
});

test("invalid browse parameters fall back without sending malformed filters", async ({
  page,
}) => {
  const requests = [];
  await page.route("https://api.themoviedb.org/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/discover/movie"))
      requests.push(Object.fromEntries(url.searchParams));
    return route.fulfill({ json: { results: [], genres: [], total_pages: 1 } });
  });
  await page.goto(
    "/movies?page=99999&genre=28junk&rating=11&year=oops&country=XX&runtime=forever&sort=oops",
  );
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  expect(requests[0].page).toBe("1");
  expect(requests[0].with_genres).toBeUndefined();
  expect(requests[0]["vote_average.gte"]).toBeUndefined();
  expect(requests[0].with_origin_country).toBeUndefined();
  expect(requests[0].sort_by).toBe("popularity.desc");
  await expect(
    page.getByRole("button", { name: "Minimum Rating", exact: true }),
  ).toHaveAttribute("data-value", "");
});
