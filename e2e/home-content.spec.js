import { expect, test } from "@playwright/test";

test("home page provides substantial movie discovery guidance", async ({
  page,
}) => {
  await page.goto("/");

  const guide = page.getByRole("region", {
    name: "Discover movies your way",
  });
  await expect(guide).toBeVisible();

  const wordCount = await guide.evaluate(
    (element) => element.innerText.trim().split(/\s+/).filter(Boolean).length,
  );
  expect(wordCount).toBeGreaterThanOrEqual(250);

  await expect(
    guide.getByRole("link", { name: "Browse and filter movies" }),
  ).toHaveAttribute("href", "/movies");
  await expect(
    guide.getByRole("link", { name: "Open your watchlist" }),
  ).toHaveAttribute("href", "/watchlist");
});
