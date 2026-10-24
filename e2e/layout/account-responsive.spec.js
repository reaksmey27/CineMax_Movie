import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("signed-in account pages fit small and tablet screens", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/profile",
    "/favorites",
    "/watchlist",
    "/history",
    "/notifications",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    for (const width of [320, 640, 768, 1280]) {
      await page.setViewportSize({ width, height: 600 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBe(true);
    }
  }
});

for (const language of ["en", "km"]) {
  test(`history fits phones, tablets and desktops in ${language}`, async ({
    page,
  }) => {
    await setupPlaybackHistory(page);
    await page.addInitScript((language) => {
      localStorage.setItem("cinemax_language", language);
      localStorage.setItem(
        "history-fan",
        JSON.stringify(
          Array.from({ length: 6 }, (_, index) => ({
            id: index + 1,
            title:
              index === 0
                ? "AReallyLongMovieTitleWithoutSpacesThatMustNotOverflowTheCard"
                : "ភាពយន្តដែលអ្នកចង់បន្តមើលនៅថ្ងៃស្អែក",
            posterImage: "/images/logo.png",
            positionSeconds: 125,
            durationSeconds: 7200,
            completed: false,
            lastWatchedAt: "2026-10-22T00:00:00.000Z",
            server: "Server 4",
          })),
        ),
      );
    }, language);
    await page.goto("/history");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      language === "km" ? "ប្រវត្តិមើល" : "History",
    );
    for (const width of [320, 390, 768, 1024, 1280, 1536, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("article")).toHaveCount(6);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `page overflow at ${width}`,
      ).toBe(true);
      expect(
        await page
          .locator("article")
          .evaluateAll((cards) =>
            cards.every((card) => card.scrollWidth <= card.clientWidth),
          ),
        `card overflow at ${width}`,
      ).toBe(true);
      await expect
        .poll(
          () =>
            page
              .locator("article button")
              .evaluateAll((buttons) =>
                buttons.every(
                  (button) => button.getBoundingClientRect().height >= 44,
                ),
              ),
          { message: `touch targets at ${width}` },
        )
        .toBe(true);
    }
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.locator('[aria-controls="mobile-navigation"]').click();
    await expect(page.locator("#mobile-navigation")).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
}
