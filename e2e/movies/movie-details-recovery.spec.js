import { expect, test } from "@playwright/test";

for (const failure of ["network", 503, 429]) {
  test(`movie details recover from ${failure} without reloading`, async ({
    page,
  }) => {
    let failed = true;
    await page.route("https://api.themoviedb.org/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (!path.endsWith("/movie/42"))
        return route.fulfill({ json: { results: [], genres: [] } });
      if (failed)
        return failure === "network"
          ? route.abort("internetdisconnected")
          : route.fulfill({ status: failure, json: {} });
      return route.fulfill({
        json: {
          id: 42,
          title: "Recovered Details",
          genres: [],
          credits: {},
          videos: { results: [] },
        },
      });
    });
    await page.goto("/movie/42");
    await expect(
      page.getByText("Could not load movie details.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Movie not found", { exact: true }),
    ).toHaveCount(0);
    await page.evaluate(() => {
      window.detailsDocumentMarker = true;
    });
    failed = false;
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Recovered Details", level: 1 }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.detailsDocumentMarker)).toBe(true);
  });
}

test("missing movie offers working browse navigation instead of retry", async ({
  page,
}) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill(
      new URL(route.request().url()).pathname.endsWith("/movie/42")
        ? { status: 404, json: { status_message: "Not found" } }
        : { json: { results: [], genres: [], total_pages: 1 } },
    ),
  );
  await page.goto("/movie/42");
  await expect(
    page.getByText("Movie not found", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Browse Movies", exact: true })
    .click();
  await expect(page).toHaveURL(/\/movies$/);
});
