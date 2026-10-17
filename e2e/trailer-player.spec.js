import { expect, test } from "@playwright/test";

const mockMovieDetails = async (page) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      requestUrl.hostname !== "api.themoviedb.org" ||
      !requestUrl.pathname.endsWith("/movie/42")
    ) {
      await route.continue();
      return;
    }

    await route.fulfill({
      headers: { "access-control-allow-origin": "*" },
      json: {
        id: 42,
        title: "Example Film",
        release_date: "2024-01-01",
        overview: "A test movie.",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 7.5,
        runtime: 100,
        genres: [{ name: "Drama" }],
        videos: {
          results: [
            {
              site: "YouTube",
              type: "Trailer",
              key: "test-trailer-key",
            },
          ],
        },
      },
    });
  });
};

test("trailer player supports Escape, focus trapping, minimize, expand, and stop", async ({
  page,
}) => {
  await mockMovieDetails(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Watch Trailer" }).click();

  const iframe = page.getByTitle("Example Film trailer");
  await expect(iframe).toHaveAttribute(
    "src",
    "https://www.youtube.com/embed/test-trailer-key?autoplay=1&rel=0",
  );
  await iframe.evaluate((element) => {
    window.trailerFrameForTest = element;
  });

  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", {
      name: "Example Film minimized trailer player",
    }),
  ).toBeVisible();
  const expandButton = page.getByRole("button", {
    name: "Expand trailer player",
  });
  await expect(expandButton).toBeFocused();
  expect(
    await iframe.evaluate((element) => element === window.trailerFrameForTest),
  ).toBe(true);

  await expandButton.click();
  await expect(
    page.getByRole("dialog", { name: "Example Film trailer player" }),
  ).toHaveAttribute("aria-modal", "true");
  const minimizeButton = page.getByRole("button", {
    name: "Minimize trailer and keep watching",
  });
  await expect(minimizeButton).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(iframe).toBeFocused();
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Home" })
    .focus();
  await expect(minimizeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Expand trailer player" }).click();
  await page
    .getByRole("button", { name: "Minimize trailer and keep watching" })
    .click();
  await page.getByRole("button", { name: "Stop trailer" }).click();
  await expect(
    page.getByRole("dialog", { name: /Example Film .*trailer player/ }),
  ).toHaveCount(0);
  await expect(iframe).toHaveCount(0);
});

test("trailer modal and minimized player fit a 320px mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockMovieDetails(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Watch Trailer" }).click();

  const modal = page.getByRole("dialog", {
    name: "Example Film trailer player",
  });
  await expect(modal).toBeVisible();
  const modalBounds = await modal.boundingBox();
  expect(modalBounds).not.toBeNull();
  expect(modalBounds.x).toBeGreaterThanOrEqual(0);
  expect(modalBounds.x + modalBounds.width).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page
    .getByRole("button", { name: "Minimize trailer and keep watching" })
    .click();
  const miniPlayer = page.getByRole("dialog", {
    name: "Example Film minimized trailer player",
  });
  await expect(miniPlayer).toBeVisible();
  const miniBounds = await miniPlayer.boundingBox();
  expect(miniBounds).not.toBeNull();
  expect(miniBounds.x).toBeGreaterThanOrEqual(0);
  expect(miniBounds.y).toBeGreaterThanOrEqual(0);
  expect(miniBounds.x + miniBounds.width).toBeLessThanOrEqual(320);
  expect(miniBounds.y + miniBounds.height).toBeLessThanOrEqual(740);
});
