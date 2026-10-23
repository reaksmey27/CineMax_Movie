import { expect, test } from "@playwright/test";
import km from "../../src/i18n/locales/km.js";

for (const pageName of ["signup", "reset-password"]) {
  for (const language of ["en", "km"]) {
    test(`${pageName}: live confirmation feedback in ${language}`, async ({ page }) => {
      await page.addInitScript((code) => localStorage.setItem("cinemax_language", code), language);
      await page.route("https://api.themoviedb.org/**", route => route.fulfill({ json: { results: [] } }));
      await page.route("**/accounts:resetPassword*", route => route.fulfill({ json: { email: "viewer@example.com", requestType: "PASSWORD_RESET" } }));
      await page.setViewportSize({ width: 320, height: 740 });
      await page.goto(pageName === "signup" ? "/signup" : "/reset-password?mode=resetPassword&oobCode=test-code");
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      const password = page.locator('input[name="password"]');
      const confirmation = page.locator('input[name="confirmPassword"]');
      const feedback = page.locator(pageName === "signup" ? "#signup-password-confirmation" : "#reset-password-confirmation");
      const translate = (message) => language === "km" ? km[message] : message;
      await expect(feedback).toBeEmpty();
      await password.fill("Example123");
      await expect(feedback).toBeEmpty();
      await confirmation.fill("Example");
      await expect(feedback).toHaveText(translate("Passwords do not match."));
      await expect(confirmation).toHaveAttribute("aria-invalid", "true");
      await confirmation.fill("Example123");
      await expect(feedback).toHaveText(translate("Passwords match."));
      await expect(confirmation).toHaveAttribute("aria-invalid", "false");
      await password.fill("Changed123");
      await expect(feedback).toHaveText(translate("Passwords do not match."));
      await confirmation.fill("");
      await expect(feedback).toBeEmpty();
      await expect(confirmation).toHaveAttribute("aria-invalid", pageName === "signup" ? "true" : "false");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
