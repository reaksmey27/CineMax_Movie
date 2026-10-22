import { expect, test } from "@playwright/test";

test("notifications support Escape and dismiss when tabbing away", async ({
  page,
}) => {
  await page.goto("/notifications");
  const trigger = page.getByRole("button", {
    name: "Notifications",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("region", {
    name: "Notifications",
    exact: true,
  });
  await expect(panel).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", {
      name: "Clear notification history",
      exact: true,
    }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await panel.getByRole("link", { name: "View all notifications" }).focus();
  await page.keyboard.press("Tab");
  await expect(panel).toBeHidden();
  await expect(trigger).not.toBeFocused();
});

test("language selection and Escape restore focus to the language trigger", async ({
  page,
}) => {
  await page.goto("/notifications");
  const menu = page.getByTestId("language-selector");
  const trigger = menu.locator("summary");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await menu.getByRole("button", { name: "English", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(menu).not.toHaveAttribute("open");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(menu).not.toHaveAttribute("open");
});

test("donation dialog traps keyboard focus, closes with Escape, and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/notifications");
  const trigger = page.getByRole("button", { name: "Buy me a coffee" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Buy me a coffee" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await expect(trigger).toHaveCSS("transition-duration", "1e-05s");
  const controls = dialog.locator("button:not([disabled]), a[href]");
  await controls.first().focus();
  await page.keyboard.press("Shift+Tab");
  await expect(controls.last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS("outline-style", "solid");
});
