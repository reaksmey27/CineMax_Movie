import { expect, test } from "@playwright/test";
import km from "../../src/i18n/locales/km.js";

for (const language of ["en", "km"]) {
  test(`signup focuses invalid fields and clears corrected errors in ${language}`, async ({ page }) => {
    await page.addInitScript(code => localStorage.setItem("cinemax_language", code), language);
    await page.route("https://api.themoviedb.org/**", route => route.fulfill({ json: { results: [] } }));
    let writes = 0;
    await page.route("**/accounts:signUp*", route => {
      writes++;
      return route.fulfill({ status: 400, json: { error: { message: "EMAIL_EXISTS" } } });
    });
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/signup");
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    const field = name => page.locator(`input[name="${name}"]`);
    const submit = page.locator('button[type="submit"]');
    const message = key => language === "km" ? km[key] : key;
    await submit.click();
    await expect(field("name")).toBeFocused();
    await expect(page.locator("#signup-name-error")).toHaveText(message("Enter at least 2 characters for your name."));
    await field("name").fill("Viewer");
    await expect(page.locator("#signup-name-error")).toBeEmpty();
    await field("email").fill("viewer@");
    await submit.click();
    await expect(field("email")).toBeFocused();
    await expect(field("email")).toHaveAccessibleDescription(message("Enter a valid email address."));
    await field("email").fill("viewer@example.com");
    await expect(field("email")).toHaveAttribute("aria-invalid", "false");
    await submit.click();
    await expect(field("password")).toBeFocused();
    await field("password").fill("Example123");
    await submit.click();
    await expect(field("confirmPassword")).toBeFocused();
    await expect(page.locator("#signup-confirmPassword-error")).toHaveText(message("Confirm your password."));
    expect(writes).toBe(0);
    await field("confirmPassword").fill("Example123");
    await expect(page.locator("#signup-confirmPassword-error")).toBeEmpty();
    await expect(field("confirmPassword")).toHaveAttribute("aria-invalid", "false");
    await submit.click();
    await expect.poll(() => writes).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
