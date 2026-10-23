import { expect, test } from "@playwright/test";

test("password toggles preserve values, work with the keyboard, and reset between forms", async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  let submissions = 0;
  await page.route("**/accounts:signInWithPassword*", (route) => {
    submissions++;
    return route.fulfill({ status: 400, json: { error: { message: "INVALID_LOGIN_CREDENTIALS" } } });
  });
  await page.goto("/login");
  const password = page.getByLabel("Password", { exact: true });
  await page.getByLabel("Enter Your Email", { exact: true }).fill("viewer@example.com");
  await password.fill("Test-password-123");
  await expect(password).toHaveAttribute("type", "password");
  await password.press("Tab");
  const show = page.getByRole("button", { name: "Show password", exact: true });
  await expect(show).toBeFocused();
  await show.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("Test-password-123");
  await page.getByRole("button", { name: "Hide password", exact: true }).press("Space");
  await expect(password).toHaveAttribute("type", "password");
  expect(submissions).toBe(0);

  await page.getByRole("link", { name: "Sign up", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Join CineMax" })).toBeVisible();
  const confirmation = page.getByLabel("Confirm Password", { exact: true });
  await password.fill("Test-password-123");
  await confirmation.fill("Test-password-123");
  await page.getByRole("button", { name: "Show confirmation password", exact: true }).click();
  await expect(confirmation).toHaveAttribute("type", "text");
  await expect(password).toHaveAttribute("type", "password");
  await show.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("Test-password-123");
  await expect(confirmation).toHaveValue("Test-password-123");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("");
});
