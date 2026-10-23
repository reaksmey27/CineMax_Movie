import { expect, test } from "@playwright/test";

test("Caps Lock warnings follow each focused password field without changing its value", async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/signup");
  const password = page.getByLabel("Password", { exact: true });
  const confirmation = page.getByLabel("Confirm Password", { exact: true });
  const warning = page.getByText("Caps Lock is on", { exact: true });
  await password.fill("Example-password");
  await expect(warning).toHaveCount(0);
  // Explicit modifier state makes the test independent of the host keyboard lock.
  await password.dispatchEvent("keydown", { key: "A", modifierCapsLock: true });
  await expect(warning).toBeVisible();
  await expect(password).toHaveAccessibleDescription(/Caps Lock is on/);
  await expect(password).toHaveValue("Example-password");
  await password.dispatchEvent("keyup", { key: "CapsLock", modifierCapsLock: false });
  await expect(warning).toHaveCount(0);
  await password.dispatchEvent("keyup", { key: "CapsLock", modifierCapsLock: true });
  await expect(warning).toBeVisible();
  await confirmation.focus();
  await expect(warning).toHaveCount(0);
  await confirmation.dispatchEvent("keydown", { key: "A", modifierCapsLock: true });
  await expect(confirmation).toHaveAccessibleDescription("Caps Lock is on");
  await expect(password).toHaveAttribute("aria-describedby", "signup-password-requirements");
  await page.getByRole("button", { name: "Show confirmation password", exact: true }).click();
  await expect(warning).toHaveCount(0);
  await confirmation.focus();
  await confirmation.dispatchEvent("keydown", { key: "A", modifierCapsLock: true });
  await expect(warning).toBeVisible();
  await expect(confirmation).toHaveAttribute("type", "text");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
