import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("save a movie, return after reload, resume progress, finish and remove", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(
    page.getByText(
      "This movie is saved in History. This server does not support exact-time resume.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Server 4", exact: true }).click();
  const player = page.getByTitle("Cinema Player");
  await expect(player).toHaveAttribute("src", /vidsrc.sh/);
  await expect
    .poll(() =>
      page.frames().some((frame) => frame.url().includes("vidsrc.sh")),
    )
    .toBe(true);
  await page
    .frames()
    .find((frame) => frame.url().includes("vidsrc.sh"))
    .evaluate(() =>
      parent.postMessage(
        {
          type: "PLAYER_EVENT",
          data: {
            player_info: { tmdb: 42, mediaType: "movie" },
            player_status: "paused",
            player_progress: 125,
            player_duration: 7200,
          },
        },
        "*",
      ),
    );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("history-fan"))[0].positionSeconds,
      ),
    )
    .toBe(125);
  await page.goto("/history");
  await expect(page.locator("article")).toContainText("2:05 / 2:00:00");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toHaveCount(0);
  await page.goto("/history");
  await page.reload();
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
  await page.goto("/history");
  await page.getByRole("button", { name: "Mark as watched" }).click();
  await expect(page.locator("article")).toContainText("Watched");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toHaveCount(0);
  await page.goto("/history");
  await page.reload();
  await expect(page.locator("article")).toContainText("Watched");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => localStorage.setItem("test-account", "other"));
  await page.reload();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("test-account"));
  await page.reload();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
});

test("failed writes show a retry and save after recovery", async ({ page }) => {
  await setupPlaybackHistory(page);
  await page.goto("/movie/42");
  await page.evaluate(() => localStorage.setItem("fail-save", "1"));
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not save watch history.",
  );
  await page.evaluate(() => localStorage.removeItem("fail-save"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByText("Could not save watch history.")).toHaveCount(0);
  await page.goto("/history");
  await expect(page.locator("article")).toContainText("Example Film");
});
