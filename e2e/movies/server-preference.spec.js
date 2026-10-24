import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("preferred server persists for another movie and respects saved resume server", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await page.getByRole("button", { name: "Server 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Server 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/movie/43");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Server 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Server 3", exact: true }).click();
  await page.goto("/movie/42");
  await page
    .getByRole("button", { name: "Continue watching", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Server 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("cinemax_preferred_movie_server"),
    ),
  ).toBe("Server 3");
  await page.reload();
  await page
    .getByRole("button", { name: "Continue watching", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Server 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("unknown preferred server falls back and next-server action saves preference", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.route("https://vidsrc.pm/embed/**", () => {});
  await page.addInitScript(() =>
    localStorage.setItem("cinemax_preferred_movie_server", "Removed server"),
  );
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Server 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText(
      "This source is taking too long to respond. Try reloading or switch servers.",
    ),
  ).toBeVisible({ timeout: 18000 });
  await expect(
    page.getByRole("button", { name: "Try Server 2", exact: true }),
  ).toBeVisible({ timeout: 18000 });
  await page.getByRole("button", { name: "Try Server 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Server 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("cinemax_preferred_movie_server"),
    ),
  ).toBe("Server 2");
});

test("quick server switching cycles all servers on mobile and preserves the sandbox", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  for (const number of [2, 3, 4, 1]) {
    const button = page.getByRole("button", {
      name: `Try Server ${number}`,
      exact: true,
    });
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    await button.click();
    await expect(
      page.getByRole("button", { name: `Server ${number}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTitle("Cinema Player")).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation",
    );
    expect(
      await page.evaluate(() =>
        localStorage.getItem("cinemax_preferred_movie_server"),
      ),
    ).toBe(`Server ${number}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
  }
});

test("server switching works when preference storage is blocked", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "cinemax_preferred_movie_server")
        throw new DOMException("Blocked", "SecurityError");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "cinemax_preferred_movie_server")
        throw new DOMException("Blocked", "SecurityError");
      return set.call(this, key, value);
    };
  });
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await page.getByRole("button", { name: "Server 3", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Server 3", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
