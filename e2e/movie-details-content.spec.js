import { expect, test } from "@playwright/test";

async function mockDetails(page) {
  await page.route("https://api.themoviedb.org/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/recommendations")) {
      return route.fulfill({
        json: { results: [{ id: 43, title: "Next Film", vote_average: 8 }] },
      });
    }
    const id = Number(path.split("/").pop());
    return route.fulfill({
      json: {
        id,
        title: id === 42 ? "First Film" : "Next Film",
        genres: [],
        overview: "A movie for testing.",
        credits:
          id === 42
            ? {
                cast: [
                  {
                    id: 1,
                    name: "Example Actor",
                    character: "The Detective",
                    profile_path: "/broken.jpg",
                  },
                ],
                crew: [
                  { id: 2, name: "Example Director", job: "Director" },
                  { id: 3, name: "Second Director", job: "Director" },
                ],
              }
            : {},
      },
    });
  });
  await page.route("https://image.tmdb.org/**", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
}

test("credits and recommendations fit mobile and navigate to fresh movie details", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockDetails(page);
  await page.goto("/movie/42");
  await expect(
    page.getByRole("heading", { name: "Cast & crew" }),
  ).toBeVisible();
  await expect(
    page.getByText("Example Director, Second Director", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Example Actor", { exact: true })).toBeVisible();
  await expect(page.getByText("The Detective", { exact: true })).toBeVisible();
  await expect(page.locator('img[src*="broken.jpg"]')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Next Film", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Next Film", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Example Actor", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Cast information unavailable.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No related movies available yet.", { exact: true }),
  ).toBeVisible();
});

test("recommendation errors do not block details and can be retried", async ({
  page,
}) => {
  await mockDetails(page);
  let attempts = 0;
  await page.route("**/movie/42/recommendations**", (route) => {
    attempts++;
    return attempts === 1
      ? route.fulfill({ status: 500, body: "Unavailable" })
      : route.fulfill({ json: { results: [] } });
  });
  await page.goto("/movie/42");
  await expect(
    page.getByRole("heading", { name: "First Film", level: 1 }),
  ).toBeVisible();
  const section = page.getByRole("region", { name: "Related movies" });
  await expect(section.getByRole("alert")).toContainText(
    "Could not load related movies.",
  );
  await section.getByRole("button", { name: "Try again" }).click();
  await expect(section).toContainText("No related movies available yet.");
});
