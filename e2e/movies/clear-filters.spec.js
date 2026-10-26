import { expect, test } from "@playwright/test";

test("clear all filters preserves search and resets the release-year dropdown", async ({
  page,
}) => {
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { genres: [], results: [], total_pages: 0 } }),
  );
  await page.goto(
    "/movies?q=matrix&genre=28&year=2024&rating=7&runtime=short&sort=vote_average.desc&page=2",
  );
  const clear = page.getByRole("button", {
    name: "Clear all filters",
    exact: true,
  });
  await clear.click();
  await expect(clear).toHaveCount(0);
  const params = new URL(page.url()).searchParams;
  expect(params.get("q")).toBe("matrix");
  expect(params.get("page")).toBe("1");
  for (const key of ["genre", "year", "rating", "runtime", "sort"])
    expect(params.has(key)).toBe(false);
  const year = page.getByLabel("Release Year", { exact: true });
  await expect(year).toContainText("All years");
  await year.click();
  await page.getByRole("searchbox", { name: "Search years..." }).fill("2024");
  await page.getByRole("option", { name: "2024", exact: true }).click();
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(year).toContainText("All years");
  await expect(clear).toHaveCount(0);
  await page.reload();
  await expect(year).toContainText("All years");
  await expect(clear).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("q")).toBe("matrix");
});
