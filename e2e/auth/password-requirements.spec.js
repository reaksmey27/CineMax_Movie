import { expect, test } from "@playwright/test";
import km from "../../src/i18n/locales/km.js";

test("Khmer requirements are translated and appear only when editing passwords", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cinemax_language", "km"));
  await page.route("https://api.themoviedb.org/**", route => route.fulfill({ json: { results: [] } }));
  await page.goto("/signup");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  const checklist = page.locator("#signup-password-requirements");
  await expect(checklist).toBeHidden();
  await page.locator('input[name="password"]').focus();
  await expect(checklist).toBeVisible();
  await expect(checklist).toContainText(km["At least one number or symbol"]);
  await expect(checklist).not.toContainText("At least one");
  await page.locator('input[name="confirmPassword"]').focus();
  await expect(checklist).toBeVisible();
  await page.locator('input[name="email"]').focus();
  await expect(checklist).toBeHidden();
});

test("signup shows live requirements and blocks incomplete passwords before sending", async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", route => route.fulfill({ json: { results: [] } }));
  let attempts = 0;
  await page.route("**/accounts:signUp*", route => {
    attempts++;
    return route.fulfill({ status: 400, json: { error: { message: "EMAIL_EXISTS" } } });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/signup");
  await page.getByLabel("Full Name", { exact: true }).fill("Movie Viewer");
  await page.getByLabel("Enter Your Email", { exact: true }).fill("viewer@example.com");
  const password = page.getByLabel("Password", { exact: true });
  const confirmation = page.getByLabel("Confirm Password", { exact: true });
  await expect(page.locator("#signup-password-requirements li[data-met=true]")).toHaveCount(0);
  await expect(page.locator("#signup-password-requirements")).toBeHidden();
  await password.focus();
  await expect(page.locator("#signup-password-requirements")).toBeVisible();
  await password.fill("abcdefgh");
  await confirmation.fill("abcdefgh");
  await expect(page.locator("#signup-password-requirements li").filter({ hasText: "At least 8 characters" })).toHaveAttribute("data-met", "true");
  await expect(page.locator("#signup-password-requirements li")).toHaveCount(3);
  await expect(page.locator("#signup-password-requirements li[data-met=true]")).toHaveCount(1);
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect(page.getByText("Meet all password requirements before continuing.")).toBeVisible();
  expect(attempts).toBe(0);
  await expect(page.locator("#signup-password-requirements")).toBeHidden();
  await password.fill("Abcdefg!");
  await expect(page.locator("#signup-password-requirements li[data-met=true]")).toHaveCount(3);
  await password.fill("Abcdefg1");
  await confirmation.fill("Abcdefg1");
  await expect(page.locator("#signup-password-requirements li[data-met=true]")).toHaveCount(3);
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect.poll(() => attempts).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
