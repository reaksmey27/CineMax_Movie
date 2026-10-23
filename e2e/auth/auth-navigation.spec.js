import { expect, test } from "@playwright/test";

for (const entry of ["direct", "popup", "register"]) {
  test(`${entry}: switching auth forms preserves the dialog and posters`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("https://api.themoviedb.org/**", (route) =>
      route.fulfill({ json: { results: [], genres: [], total_pages: 0, total_results: 0 } }),
    );
    await page.goto(entry === "popup" ? "/movies?q=matrix" : entry === "register" ? "/register" : "/login");
    if (entry === "popup") {
      await page.getByRole("link", { name: "Sign In", exact: true }).first().click();
    }
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("input").first()).toBeFocused();
    await dialog.evaluate((element) => {
      window.authDialog = element;
      window.authPosters = [...element.querySelectorAll("article img")];
    });
    for (const signUp of entry === "register" ? [false, true] : [true, false]) {
      await dialog.getByRole("link", { name: signUp ? "Sign up" : "Sign in", exact: true }).click();
      await expect(page).toHaveURL(signUp ? /\/signup$/ : /\/login$/);
      await expect(dialog.getByRole("heading", { name: signUp ? "Join CineMax" : "Welcome Back" })).toBeVisible();
      await expect(dialog.locator("input").first()).toBeFocused();
      expect(await dialog.evaluate((element) => {
        const posters = [...element.querySelectorAll("article img")];
        return element === window.authDialog && posters.length > 0 &&
          posters.length === window.authPosters.length &&
          posters.every((poster, index) => poster === window.authPosters[index]);
      })).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(entry === "popup" ? /\/movies\?q=matrix$/ : /\/$/);
  });
}
