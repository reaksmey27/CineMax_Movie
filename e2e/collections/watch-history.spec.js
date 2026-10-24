import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

import { selectFilter } from "../helpers/selectFilter.js";

test("clear history confirms, cancels, reports failures and retries", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "history-fan",
      JSON.stringify([
        {
          id: 42,
          title: "Example Film",
          lastWatchedAt: "2026-01-01",
          server: "Server 1",
        },
      ]),
    );
    localStorage.setItem("fail-clear", "1");
  });
  await page.goto("/history");
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Clear watch history?" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Clear history", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Clearing...", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText(
    "Could not clear watch history",
  );
  await expect(page.locator("article")).toHaveCount(1);
  await page.evaluate(() => localStorage.removeItem("fail-clear"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Clear watch history?" }),
  ).toBeHidden();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("history-fan"))),
  ).toEqual([]);
});

test("history shows skeletons, reports a load error and retries to an empty collection", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.addInitScript(() => localStorage.setItem("delay-read", "1"));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  await expect(page.getByRole("status")).toContainText("Loading History");
  await expect(
    page.locator('[aria-busy="true"][aria-label="Loading History"]'),
  ).toBeVisible();
  await page.evaluate(() => {
    localStorage.removeItem("delay-read");
    localStorage.setItem("fail-read", "1");
    window.dispatchEvent(new Event("history-refresh"));
  });
  await expect(page.getByRole("alert")).toHaveText(
    "Could not load watch history.",
  );
  await page.evaluate(() => localStorage.removeItem("fail-read"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse Movies", exact: true }),
  ).toHaveAttribute("href", "/movies");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("history combines search, status, sorting and live watched updates", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      "history-fan",
      JSON.stringify([
        {
          id: 1,
          title: "Zodiac",
          completed: false,
          lastWatchedAt: "2026-10-22T00:00:00.000Z",
        },
        {
          id: 2,
          title: "Alien",
          completed: true,
          lastWatchedAt: "2026-10-20T00:00:00.000Z",
        },
        {
          id: 3,
          title: "Aliens",
          completed: false,
          lastWatchedAt: "2026-10-21T00:00:00.000Z",
        },
      ]),
    ),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  const library = page.getByRole("region", { name: "History", exact: true });
  const titles = library.locator("article h3");
  await expect(titles).toHaveText(["Zodiac", "Aliens", "Alien"]);
  await library.getByLabel("Search watch history").fill("  ALIEN ");
  await expect(titles).toHaveText(["Aliens", "Alien"]);
  await selectFilter(library.getByLabel("Watch status"), "unfinished");
  await expect(titles).toHaveText(["Aliens"]);
  await library.getByRole("button", { name: "Mark as watched" }).click();
  await expect(library.getByRole("status")).toHaveText("Showing 0 of 3 movies");
  await expect(
    library.getByText("No saved movies match your search or status."),
  ).toBeVisible();
  await selectFilter(library.getByLabel("Watch status"), "watched");
  await expect(titles).toHaveText(["Aliens", "Alien"]);
  await selectFilter(library.getByLabel("Sort By"), "oldest");
  await expect(titles).toHaveText(["Alien", "Aliens"]);
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(titles).toHaveText(["Zodiac", "Aliens", "Alien"]);
  await expect(library.getByLabel("Search watch history")).toHaveValue("");
  await expect(library.getByLabel("Watch status")).toHaveAttribute(
    "data-value",
    "all",
  );
  await expect(library.getByLabel("Sort By")).toHaveAttribute(
    "data-value",
    "recent",
  );
  await selectFilter(library.getByLabel("Sort By"), "title");
  await expect(titles).toHaveText(["Alien", "Aliens", "Zodiac"]);
  await library.getByLabel("Search watch history").fill("missing title");
  await expect(titles).toHaveCount(0);
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(titles).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("undo watched preserves progress, updates filters and restores Continue watching", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.addInitScript(() => {
    if (!localStorage.getItem("history-fan"))
      localStorage.setItem(
        "history-fan",
        JSON.stringify([
          {
            id: 42,
            title: "Example Film",
            completed: true,
            positionSeconds: 125,
            durationSeconds: 7200,
            server: "Server 4",
            lastWatchedAt: "2026-10-20T00:00:00.000Z",
          },
        ]),
      );
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  await selectFilter(page.getByLabel("Watch status"), "watched");
  await page.evaluate(() => localStorage.setItem("fail-status", "1"));
  await page.getByRole("button", { name: "Mark as unfinished" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not save watch history.",
  );
  await expect(
    page.getByRole("button", { name: "Mark as unfinished" }),
  ).toBeEnabled();
  await page.evaluate(() => localStorage.removeItem("fail-status"));
  await page.getByRole("button", { name: "Mark as unfinished" }).click();
  await expect(page.locator("article")).toHaveCount(0);
  await selectFilter(page.getByLabel("Watch status"), "unfinished");
  await expect(page.locator("article")).toContainText("2:05 / 2:00:00");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mark as watched" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toHaveCount(0);
  await page.goto("/history");
  await page
    .locator("article")
    .getByRole("link", { name: "Continue watching" })
    .click();
  await page
    .getByRole("button", { name: "Continue watching", exact: true })
    .click();
  await expect(page.getByTitle("Cinema Player")).toHaveAttribute(
    "src",
    /startAt=125/,
  );
});
