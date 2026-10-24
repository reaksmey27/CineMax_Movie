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
