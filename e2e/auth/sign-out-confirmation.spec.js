import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/src/context/AuthContext.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    const user = { uid: 'test', name: 'Movie Fan', email: 'fan@example.com' };
    export const AuthProvider = ({children}) => children;
    export const useAuth = () => ({ user, loading: false, isAuthenticated: true,
      logout: async () => { window.logoutCalls = (window.logoutCalls || 0) + 1;
        await new Promise(resolve => { window.completeLogout = resolve; });
        return !window.failLogout;
      }
    });`,
    }),
  );
  await page.route("**/src/context/FavoritesContext.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `export const FavoritesProvider=({children})=>children; export const useFavorites=()=>({favorites:[], loading:false});`,
    }),
  );
  await page.route("**/src/context/WatchlistContext.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `export const WatchlistProvider=({children})=>children; export const useWatchlist=()=>({watchlist:[], loading:false});`,
    }),
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [], genres: [] } }),
  );
});

for (const mobile of [false, true]) {
  test(`${mobile ? "mobile menu" : "profile"} confirms sign out and supports cancellation and retry`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(mobile ? "/notifications" : "/profile");
    if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
    const trigger = page.getByRole("button", {
      name: mobile ? "Logout" : "Log out",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Sign out?", exact: true });
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    expect(await page.evaluate(() => window.logoutCalls || 0)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    expect(await page.evaluate(() => window.logoutCalls || 0)).toBe(0);
    await trigger.click();
    await page.evaluate(() => {
      window.failLogout = true;
    });
    await dialog.getByRole("button", { name: "Sign Out", exact: true }).click();
    await expect(
      dialog.getByRole("button", { name: "Logging out..." }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await page.evaluate(() => window.completeLogout());
    await expect(dialog.getByRole("alert")).toBeVisible();
    await page.evaluate(() => {
      window.failLogout = false;
    });
    await dialog.getByRole("button", { name: "Try again" }).click();
    await page.evaluate(() => window.completeLogout());
    await expect(page).toHaveURL(/\/$/);
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => window.logoutCalls)).toBe(2);
  });
}
