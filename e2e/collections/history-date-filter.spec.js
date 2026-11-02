import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("date filters combine with status, survive reload and reset", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.clock.setFixedTime(new Date("2026-11-04T12:00:00Z"));
  await page.addInitScript(() => {
    const now = new Date();
    const localDate = (day) =>
      new Date(now.getFullYear(), now.getMonth(), day, 1).toISOString();
    localStorage.setItem(
      "history-fan",
      JSON.stringify([
        {
          id: 42,
          title: "Today movie",
          completed: true,
          lastWatchedAt: localDate(4),
        },
        {
          id: 43,
          title: "Week movie",
          completed: false,
          lastWatchedAt: localDate(2),
        },
        {
          id: 44,
          title: "Month movie",
          completed: true,
          lastWatchedAt: localDate(1),
        },
        {
          id: 45,
          title: "Older movie",
          completed: true,
          lastWatchedAt: localDate(0),
        },
      ]),
    );
  });
  await page.goto("/history");
  const choose = async (label, value) => {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("option", { name: value, exact: true }).click();
  };
  await choose("Watch date", "Today");
  await expect(
    page.getByText("Showing 1 of 4 movies", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Watch date", exact: true }),
  ).toHaveAttribute("data-value", "today");
  await choose("Watch date", "This week");
  await expect(
    page.getByText("Showing 2 of 4 movies", { exact: true }),
  ).toBeVisible();
  await choose("Watch status", "Watched (3)");
  await expect(
    page.getByText("Showing 1 of 4 movies", { exact: true }),
  ).toBeVisible();
  await choose("Watch date", "This month");
  await expect(
    page.getByText("Showing 2 of 4 movies", { exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("Older");
  await expect(page.getByText("No movies match these filters.")).toBeVisible();
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(
    page.getByText("Showing 4 of 4 movies", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
