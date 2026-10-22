import { selectFilter } from "./helpers/selectFilter.js";
import { expect, test } from "@playwright/test";

async function fixtures(page) {
  for (const [name, component] of Object.entries({
    favorites: "Favorites",
    watchlist: "Watchlist",
    history: "History",
  })) {
    await page.route(`**/src/pages/${name}/${component}Page.jsx`, (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `import React from '/node_modules/.vite/deps/react.js';
        import Library from '/src/pages/${name}/${component}Library.jsx';
        const movies = [{id:1,title:'Alien',rating:8,savedAt:'2026-01-01',lastWatchedAt:'2026-01-01'}];
        export default function Fixture() { return React.createElement('main', {style:{paddingTop:150}}, React.createElement(Library, {movies,history:movies,isSaving:()=>false,setWatched:()=>{}})); }`,
      }),
    );
  }
}

for (const collection of ["favorites", "watchlist", "history"]) {
  test(`${collection} remembers preferences and reset across reloads`, async ({
    page,
  }) => {
    await fixtures(page);
    await page.goto(`/${collection}`);
    await page.setViewportSize({ width: 320, height: 740 });
    const sortTrigger = page.getByRole("button", {
      name: "Sort By",
      exact: true,
    });
    await sortTrigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("listbox", { name: "Sort By", exact: true });
    await expect(menu.getByRole("option", { selected: true })).toBeFocused();
    const bounds = await menu.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    await page.screenshot({ path: test.info().outputPath("dropdown.png") });
    await page.keyboard.press("End");
    await expect(menu.getByRole("option").last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(sortTrigger).toBeFocused();
    const search = page.locator("main").getByRole("searchbox");
    await search.fill("Alien");
    await selectFilter(page.getByLabel("Sort By"), "title");
    if (collection !== "favorites")
      await selectFilter(page.getByLabel("Watch status"), "watched");
    await page.goto("/notifications");
    await page.goto(`/${collection}`);
    await expect(search).toHaveValue("Alien");
    await expect(page.getByLabel("Sort By")).toHaveAttribute(
      "data-value",
      "title",
    );
    await page.reload();
    await expect(search).toHaveValue("Alien");
    if (collection !== "favorites")
      await expect(page.getByLabel("Watch status")).toHaveAttribute(
        "data-value",
        "watched",
      );
    await page.getByRole("button", { name: "Reset filters" }).click();
    await page.reload();
    await expect(search).toHaveValue("");
    await expect(page.getByLabel("Sort By")).toHaveAttribute(
      "data-value",
      collection === "history" ? "recent" : "saved",
    );
    await expect(
      page.getByRole("button", { name: "Reset filters" }),
    ).toHaveCount(0);
  });
}

test("preferences stay separate and invalid stored values fall back safely", async ({
  page,
}) => {
  await fixtures(page);
  await page.goto("/favorites");
  await page.locator("main").getByRole("searchbox").fill("Alien");
  await page.evaluate(() => {
    localStorage.setItem(
      "cinemax:collection-filters:v1:watchlist",
      JSON.stringify({ query: 42, status: "invalid", sort: "oldest" }),
    );
    localStorage.setItem(
      "cinemax:collection-filters:v1:history",
      "broken JSON",
    );
  });
  for (const collection of ["watchlist", "history"]) {
    await page.goto(`/${collection}`);
    await expect(page.locator("main").getByRole("searchbox")).toHaveValue("");
    await expect(page.getByLabel("Watch status")).toHaveAttribute(
      "data-value",
      "all",
    );
    await expect(page.getByLabel("Sort By")).toHaveAttribute(
      "data-value",
      collection === "history" ? "recent" : "saved",
    );
  }
  await page.goto("/favorites");
  await expect(page.locator("main").getByRole("searchbox")).toHaveValue(
    "Alien",
  );
});

test("filters remain usable when browser storage is blocked", async ({
  page,
}) => {
  await fixtures(page);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/favorites");
  const search = page.locator("main").getByRole("searchbox");
  await search.fill("missing movie");
  await expect(
    page.getByText("No Movies Found", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(search).toHaveValue("");
});
