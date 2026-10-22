import { expect, test } from "@playwright/test";

test("auth forms and tablet search stay usable on short screens", async ({
  page,
}) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  for (const path of ["/login", "/signup"]) {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(path);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const size of [
      { width: 320, height: 568 },
      { width: 667, height: 375 },
    ]) {
      await page.setViewportSize(size);
      const submit = dialog.locator('button[type="submit"]');
      await submit.scrollIntoViewIfNeeded();
      await expect(submit).toBeInViewport();
      expect(
        await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 640, height: 600 });
  await page.goto("/history");
  await page
    .getByRole("button", { name: "Search movies", exact: true })
    .click();
  const search = page.getByRole("combobox", {
    name: "Search movies",
    exact: true,
  });
  await search.fill("alien");
  await search.press("Escape");
  await expect(
    page.getByRole("button", { name: "Search movies", exact: true }),
  ).toBeFocused();
});

for (const language of ["en", "km"]) {
  test(`main pages fit common screen sizes in ${language}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (language) => localStorage.setItem("cinemax_language", language),
      language,
    );
    await page.route("https://api.themoviedb.org/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const movie = {
        id: 42,
        title: "A Long Movie Title for Responsive Layout Checks",
        overview:
          "A movie used to check responsive layouts across screen sizes.",
        release_date: "2099-01-01",
        vote_average: 8,
        genre_ids: [28],
        genres: [{ id: 28, name: "Action" }],
        credits: { cast: [], crew: [] },
        videos: { results: [] },
      };
      return route.fulfill({
        json: path.endsWith("/movie/42")
          ? movie
          : path.includes("/genre/")
            ? { genres: [{ id: 28, name: "Action" }] }
            : { results: [movie], page: 1, total_pages: 1, total_results: 1 },
      });
    });
    await page.route("https://image.tmdb.org/**", (route) => route.abort());
    const failures = [];
    for (const path of [
      "/",
      "/movies",
      "/trending",
      "/upcoming",
      "/movie/42",
      "/favorites",
      "/watchlist",
      "/history",
      "/profile",
      "/notifications",
      "/login",
      "/signup",
      "/privacy",
      "/terms",
    ]) {
      await page.goto(path);
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; }",
      });
      await expect(page.locator("h1").first()).toBeAttached();
      for (const width of [320, 390, 640, 768, 1024, 1280, 1536, 1920]) {
        await page.setViewportSize({ width, height: 800 });
        const issues = await page.evaluate(() => {
          const errors = [];
          if (document.documentElement.scrollWidth > innerWidth)
            errors.push("page overflow");
          const nav = document.querySelector(".site-navbar nav");
          if (nav && nav.scrollWidth > nav.clientWidth)
            errors.push("navbar overflow");
          if (nav) {
            const children = [...nav.children]
              .filter((el) => el.getClientRects().length)
              .map((el) => el.getBoundingClientRect());
            for (let i = 1; i < children.length; i++)
              if (children[i].left < children[i - 1].right - 1)
                errors.push("navbar overlap");
          }
          const heading = document.querySelector("main h1:not(.sr-only)");
          if (
            heading &&
            nav &&
            heading.getBoundingClientRect().top <
              nav.getBoundingClientRect().bottom
          )
            errors.push("heading under navbar");
          return errors;
        });
        failures.push(...issues.map((issue) => `${path} ${width}: ${issue}`));
        if (path === "/movies" && width === 1280 && language === "en")
          await page.screenshot({
            path: "test-results/responsive-desktop.png",
          });
      }
    }
    expect(failures).toEqual([]);
  });
}
