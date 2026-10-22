import { expect, test } from "@playwright/test";
const path = "/reset-password?mode=resetPassword&oobCode=test-code";
test.beforeEach(async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
});
test("valid link checks code, validates confirmation and resets password on site", async ({
  page,
}) => {
  const writes = [];
  await page.route("**/accounts:resetPassword*", async (route) => {
    const body = route.request().postDataJSON();
    if (body.newPassword) writes.push(body);
    await route.fulfill({
      json: { email: "viewer@example.com", requestType: "PASSWORD_RESET" },
    });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(path + "&continueUrl=https://example.com");
  await expect(
    page.getByText("viewer@example.com", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("new-password-123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("different-password");
  await page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Passwords do not match.");
  expect(writes).toHaveLength(0);
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("new-password-123");
  await page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Password reset. You can now sign in.",
  );
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({
    oobCode: "test-code",
    newPassword: "new-password-123",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveURL(/\/reset-password\?/);
  await page.getByRole("link", { name: "Back to sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test("expired and missing links cannot submit a password", async ({ page }) => {
  let requests = 0;
  await page.route("**/accounts:resetPassword*", (route) => {
    requests++;
    return route.fulfill({
      status: 400,
      json: { error: { message: "EXPIRED_OOB_CODE" } },
    });
  });
  await page.goto("/reset-password");
  await expect(page.getByRole("alert")).toContainText("invalid or expired");
  expect(requests).toBe(0);
  await page.goto(path);
  await expect(page.getByRole("alert")).toContainText("invalid or expired");
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
});
test("verification failure retries and weak password remains editable", async ({
  page,
}) => {
  let failVerification = true;
  await page.route("**/accounts:resetPassword*", (route) => {
    const body = route.request().postDataJSON();
    if (body.newPassword)
      return route.fulfill({
        status: 400,
        json: {
          error: { message: "WEAK_PASSWORD : Password should be stronger" },
        },
      });
    return failVerification
      ? route.fulfill({
          status: 400,
          json: { error: { message: "INTERNAL_ERROR" } },
        })
      : route.fulfill({
          json: { email: "viewer@example.com", requestType: "PASSWORD_RESET" },
        });
  });
  await page.goto(path);
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  failVerification = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByLabel("Password", { exact: true }).fill("abcdef");
  await page.getByLabel("Confirm password", { exact: true }).fill("abcdef");
  await page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("stronger password");
  await expect(page.getByLabel("Password", { exact: true })).toBeEnabled();
});
