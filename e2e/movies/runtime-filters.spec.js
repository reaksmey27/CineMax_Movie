import { expect, test } from "@playwright/test";

test("runtime discovery sends exact bounds, resets pagination and clears with filters", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/genre/movie/list**", (route) =>
    route.fulfill({ json: { genres: [] } }),
  );
  await page.route("**/discover/movie**", (route) => {
    requests.push(
      Object.fromEntries(new URL(route.request().url()).searchParams),
    );
    return route.fulfill({ json: { results: [], total_pages: 4 } });
  });
  await page.goto("/movies?page=3");
  const trigger = page.locator("#filter-select-runtime");
  for (const [label, value, min, max] of [
    ["Under 90 minutes", "short", "1", "89"],
    ["90–120 minutes", "medium", "90", "120"],
    ["Over 2 hours", "long", "121", undefined],
  ]) {
    await trigger.click();
    await page.getByRole("option", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp("runtime=" + value));
    await expect.poll(() => requests.at(-1)?.["with_runtime.gte"]).toBe(min);
    expect(requests.at(-1)["with_runtime.lte"]).toBe(max);
    expect(requests.at(-1).page).toBe("1");
  }
  await page.reload();
  await expect(trigger).toHaveAttribute("data-value", "long");
  await page
    .getByRole("button", { name: "Clear all filters", exact: true })
    .click();
  await expect(trigger).toHaveAttribute("data-value", "");
  await expect(page).not.toHaveURL(/runtime=/);
});

test("runtime works with search across pages and keeps the search query", async ({
  page,
}) => {
  await page.route("**/genre/movie/list**", (route) =>
    route.fulfill({ json: { genres: [] } }),
  );
  await page.route("**/search/movie**", (route) => {
    const second =
      new URL(route.request().url()).searchParams.get("page") === "2";
    return route.fulfill({
      json: {
        total_pages: 2,
        results: [
          { id: second ? 2 : 1, title: second ? "Short Film" : "Long Film" },
        ],
      },
    });
  });
  await page.route(/\/3\/movie\/\d+\?/, (route) =>
    route.fulfill({
      json: {
        runtime: new URL(route.request().url()).pathname.endsWith("/2")
          ? 89
          : 121,
      },
    }),
  );
  await page.goto("/movies?q=Film&runtime=short");
  await expect(
    page.getByRole("link", { name: "Short Film", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Long Film", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Clear all filters", exact: true })
    .click();
  await expect(page).toHaveURL(/q=Film/);
  await expect(page).not.toHaveURL(/runtime=/);
});
