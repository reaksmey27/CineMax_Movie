import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({
      json: {
        id: 42,
        title: "Example Film",
        genres: [],
        videos: { results: [] },
        credits: { cast: [], crew: [] },
        results: [],
      },
    }),
  );
});

test("copies the clean movie link when native sharing is unavailable and retries errors", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          if (!window.copyAllowed) throw new Error("Denied");
          window.copiedLink = text;
        },
      },
      configurable: true,
    });
  });
  await page.goto("/movie/42?server=2#player");
  const button = page.getByRole("button", { name: "Share movie", exact: true });
  await button.click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not share this movie. Try again.",
  );
  await page.evaluate(() => {
    window.copyAllowed = true;
  });
  await button.click();
  await expect(
    page.getByText("Movie link copied.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.copiedLink)).toBe(
    "http://127.0.0.1:4173/movie/42",
  );
});

test("native sharing reports success, disables repeats, and treats cancellation quietly", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.shareCalls = [];
    Object.defineProperty(navigator, "share", {
      value: (data) => {
        window.shareCalls.push(data);
        return new Promise((resolve, reject) => {
          window.finishShare = resolve;
          window.cancelShare = () =>
            reject(new DOMException("Cancelled", "AbortError"));
        });
      },
      configurable: true,
    });
  });
  await page.goto("/movie/42");
  const button = page.getByRole("button", { name: "Share movie", exact: true });
  await button.click();
  await expect(button).toBeDisabled();
  expect(await page.evaluate(() => window.shareCalls)).toEqual([
    { title: "Example Film", url: "http://127.0.0.1:4173/movie/42" },
  ]);
  await page.evaluate(() => window.finishShare());
  await expect(
    page.getByText("Share menu opened.", { exact: true }),
  ).toBeVisible();
  await button.click();
  await page.evaluate(() => window.cancelShare());
  await expect(button).toBeEnabled();
  await expect(
    page.getByText("Share menu opened.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Could not share this movie. Try again.", { exact: true }),
  ).toHaveCount(0);
});
