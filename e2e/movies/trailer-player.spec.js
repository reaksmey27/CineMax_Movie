import { expect, test } from "@playwright/test";

const mockMovieDetails = async (page, hasTrailer = true) => {
  await page.route("https://www.youtube.com/embed/**", (route) =>
    route.fulfill({ body: "" }),
  );
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.hostname !== "api.themoviedb.org") {
      await route.continue();
      return;
    }
    if (!requestUrl.pathname.endsWith("/movie/42")) {
      await route.fulfill({
        json: { results: [], genres: [], total_pages: 0 },
      });
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
          results: hasTrailer
            ? [
                {
                  site: "YouTube",
                  type: "Trailer",
                  key: "test-trailer-key",
                },
              ]
            : [],
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

  await page
    .getByRole("button", { name: "Minimize trailer and keep watching" })
    .click();
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
  await expect(iframe).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Watch Trailer" }),
  ).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "Watch Trailer" }).click();
  await page
    .getByRole("button", { name: "Minimize trailer and keep watching" })
    .click();
  await page.getByRole("button", { name: "Stop trailer" }).click();
  await expect(
    page.getByRole("dialog", { name: /Example Film .*trailer player/ }),
  ).toHaveCount(0);
  await expect(iframe).toHaveCount(0);
});

test("outside click and close button remove the trailer iframe", async ({
  page,
}) => {
  await mockMovieDetails(page);
  await page.route("https://www.youtube.com/embed/**", (route) =>
    route.fulfill({ body: "" }),
  );
  await page.goto("/movie/42");
  for (const action of ["outside", "button"]) {
    await page.getByRole("button", { name: "Watch Trailer" }).click();
    await expect(page.getByTitle("Example Film trailer")).toBeVisible();
    if (action === "outside") {
      await page
        .getByRole("dialog", { name: "Example Film trailer player" })
        .click({ position: { x: 2, y: 2 } });
    } else {
      await page.getByRole("button", { name: "Stop trailer" }).click();
    }
    await expect(page.getByTitle("Example Film trailer")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Watch Trailer" }),
    ).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  }
});

test("missing trailer shows an explanation", async ({ page }) => {
  await mockMovieDetails(page, false);
  await page.goto("/movie/42");
  await expect(
    page.getByText("No trailer is available for this movie yet."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Watch Trailer" })).toHaveCount(
    0,
  );
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

test("movie actions keep strong contrast in light theme", async ({ page }) => {
  await mockMovieDetails(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Switch to light mode" }).click();

  await expect(page.locator(".movie-play-button")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await expect(page.getByRole("button", { name: "Watch Trailer" })).toHaveCSS(
    "color",
    "rgb(15, 23, 42)",
  );

  const favoriteButton = page.locator(".movie-favorite-button");
  await expect(favoriteButton).toHaveAttribute("aria-pressed", "false");
  await favoriteButton.evaluate((button) =>
    button.setAttribute("aria-pressed", "true"),
  );
  await expect(favoriteButton).toHaveCSS("color", "rgb(185, 28, 28)");

  const watchlistButton = page.locator(".movie-watchlist-button");
  await expect(watchlistButton).toHaveAttribute("aria-pressed", "false");
  await watchlistButton.evaluate((button) =>
    button.setAttribute("aria-pressed", "true"),
  );
  await expect(watchlistButton).toHaveCSS("color", "rgb(146, 64, 14)");
});
