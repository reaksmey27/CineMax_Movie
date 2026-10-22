import { expect, test } from "@playwright/test";

const endpoint = "**/accounts:sendOobCode*";
const confirmation =
  "If an account exists for this email, a reset link will arrive shortly. Check your inbox and spam folder.";
test.beforeEach(async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
});

test("reset validates email, sends once, and returns to login with focus and email intact", async ({
  page,
}) => {
  const requests = [];
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(endpoint, async (route) => {
    requests.push(route.request().postDataJSON());
    await held;
    await route.fulfill({ json: { email: "viewer@example.com" } });
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/login");
  await page
    .getByLabel("Enter Your Email", { exact: true })
    .fill("viewer@example.com");
  await page
    .getByRole("button", { name: "Forgot password?", exact: true })
    .click();
  const email = page.getByLabel("Email address", { exact: true });
  await expect(email).toHaveValue("viewer@example.com");
  await expect(email).toBeFocused();
  await email.fill("invalid");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  expect(await email.evaluate((element) => element.validity.valid)).toBe(false);
  expect(requests).toHaveLength(0);
  await email.fill("viewer@example.com");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sending reset link...", exact: true }),
  ).toBeDisabled();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]).toMatchObject({
    requestType: "PASSWORD_RESET",
    email: "viewer@example.com",
  });
  release();
  await expect(
    page.getByRole("status").filter({ hasText: confirmation }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Back to sign in", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Forgot password?", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByLabel("Enter Your Email", { exact: true }),
  ).toHaveValue("viewer@example.com");
});

test("unknown accounts receive the same confirmation", async ({ page }) => {
  await page.route(endpoint, (route) =>
    route.fulfill({
      status: 400,
      json: { error: { message: "EMAIL_NOT_FOUND" } },
    }),
  );
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Forgot password?", exact: true })
    .click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("unknown@example.com");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: confirmation }),
  ).toBeVisible();
});

test("request failures display an error and allow retry", async ({ page }) => {
  let attempts = 0;
  await page.route(endpoint, (route) => {
    attempts++;
    return attempts === 1
      ? route.fulfill({
          status: 400,
          json: { error: { message: "TOO_MANY_ATTEMPTS_TRY_LATER" } },
        })
      : route.fulfill({ json: { email: "viewer@example.com" } });
  });
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Forgot password?", exact: true })
    .click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("viewer@example.com");
  const submit = page.getByRole("button", {
    name: "Send reset link",
    exact: true,
  });
  await submit.click();
  await expect(page.getByRole("alert")).toHaveText(
    "Too many reset attempts. Please wait and try again.",
  );
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(
    page.getByRole("status").filter({ hasText: confirmation }),
  ).toBeVisible();
});
