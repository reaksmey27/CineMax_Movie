import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

for (const theme of ["light", "dark"]) {
  test(`auth and confirmation surfaces stay readable in ${theme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (theme) => localStorage.setItem("cinemax-theme", theme),
      theme,
    );
    await page.route("https://api.themoviedb.org/**", (route) =>
      route.fulfill({ json: { results: [], genres: [] } }),
    );
    await page.goto("/login");
    const panel = page.locator(".auth-form-panel");
    await expect(panel).toHaveCSS(
      "background-color",
      theme === "light" ? "rgb(255, 255, 255)" : "rgb(35, 33, 43)",
    );
    await expect(panel.locator('button[type="submit"]')).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    if (theme === "light") {
      await expect(
        panel.getByRole("button", { name: "Forgot password?" }),
      ).toHaveCSS("color", "rgb(109, 40, 217)");
      await expect(panel.locator("p").last()).toHaveCSS(
        "color",
        "rgb(71, 85, 105)",
      );
      await page.screenshot({ path: "test-results/light-login.png" });
    }
    await setupPlaybackHistory(page);
    await page.goto("/profile");
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Sign out?", exact: true });
    await expect(dialog).toHaveCSS(
      "background-color",
      theme === "light" ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)",
    );
    await expect(
      dialog.getByRole("button", { name: "Sign Out", exact: true }),
    ).toHaveCSS("color", "rgb(255, 255, 255)");
  });
}

test("light-mode movie cards, filters and empty-state actions retain contrast", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("cinemax-theme", "light"),
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({
      json: {
        genres: [],
        page: 1,
        total_pages: 1,
        results: [
          { id: 42, title: "Theme Test", vote_average: 8, genre_ids: [] },
        ],
      },
    }),
  );
  await page.goto("/movies");
  const card = page.locator("article.movie-card").first();
  await expect(card.getByRole("heading")).toHaveCSS("color", "rgb(15, 23, 42)");
  await page
    .getByRole("button", { name: "Minimum Rating", exact: true })
    .click();
  const option = page.getByRole("option", { name: "Any Rating", exact: true });
  await expect(option).toHaveCSS("color", "rgb(15, 23, 42)");
  await expect(page.getByRole("listbox").locator("..")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await page.goto("/history");
  await expect(page.locator("main").getByRole("link", { name: "Sign In", exact: true })).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
});
