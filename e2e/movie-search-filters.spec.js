import { expect, test } from "@playwright/test";

test("search survives filter changes and reset, including matches on later pages", async ({
  page,
}) => {
  await page.route("**/genre/movie/list**", (route) =>
    route.fulfill({ json: { genres: [{ id: 18, name: "Drama" }] } }),
  );
  await page.route("**/search/movie**", (route) => {
    const current = new URL(route.request().url()).searchParams.get("page");
    const movie =
      current === "2"
        ? { id: 2, title: "Alien Drama", genre_ids: [18], vote_average: 8 }
        : { id: 1, title: "Alien Horror", genre_ids: [27], vote_average: 6 };
    return route.fulfill({ json: { results: [movie], total_pages: 2 } });
  });
  await page.goto("/movies?q=Alien");
  await expect(
    page.getByRole("link", { name: "Alien Horror", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Drama", exact: true }).click();
  await expect(page).toHaveURL(/q=Alien/);
  await expect(
    page.getByRole("link", { name: "Alien Drama", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Alien Horror", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(page).toHaveURL(/q=Alien/);
  await expect(
    page.getByRole("link", { name: "Alien Horror", exact: true }),
  ).toBeVisible();
});
