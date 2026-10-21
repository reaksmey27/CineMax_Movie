import { expect, test } from "@playwright/test";

test("footer legal links open the privacy and terms pages", async ({
  page,
}) => {
  await page.goto("/");

  const footer = page.locator("footer");

  await footer.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy Policy" }),
  ).toBeVisible();
  await expect(page.getByText("Page not found")).toHaveCount(0);

  await page.goto("/");
  await footer.getByRole("link", { name: "Terms of Use" }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Terms of Use" }),
  ).toBeVisible();
});

test("footer newsletter form shows a success state", async ({ page }) => {
  await page.goto("/");

  await page.fill("#footer-newsletter-email", "fan@example.com");
  await page.click("footer button[type='submit']");

  await expect(page.getByRole("status")).toContainText("on the list");
  await expect(page.locator("#footer-newsletter-email")).toHaveCount(0);
});
