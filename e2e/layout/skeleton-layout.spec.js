import { expect, test } from "@playwright/test";

for (const width of [375, 768, 1280, 1920]) {
  test(`detail poster keeps its loading dimensions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("https://api.themoviedb.org/**", async (route) => {
      if (new URL(route.request().url()).pathname.endsWith("/movie/42")) {
        await gate;
        return route.fulfill({
          json: {
            id: 42,
            title: "Skeleton Test",
            genres: [],
            credits: {},
            videos: { results: [] },
          },
        });
      }
      return route.fulfill({ json: { results: [], genres: [] } });
    });
    await page.goto("/movie/42", { waitUntil: "domcontentloaded" });
    const placeholder = page.getByTestId("detail-poster-skeleton");
    await expect(placeholder).toBeVisible();
    const before = await placeholder.boundingBox();
    release();
    const poster = page.locator("[data-poster-state]").first();
    await expect(poster).toBeVisible();
    const after = await poster.boundingBox();
    for (const key of ["x", "y", "width", "height"])
      expect(Math.abs(before[key] - after[key]), key).toBeLessThanOrEqual(1);
  });
}

test("grid and slider skeleton cards match loaded card height", async ({
  page,
}) => {
  await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    import React from '/node_modules/.vite/deps/react.js';
    import SkeletonCard from '/src/components/ui/loading/SkeletonCard.jsx';
    import MovieCard from '/src/components/ui/movies/MovieCard.jsx';
    export default function Fixture(){return React.createElement('section',{style:{paddingTop:150,display:'flex',gap:20}},
      React.createElement('div',{style:{width:160},'data-testid':'placeholder'},React.createElement(SkeletonCard)),
      React.createElement('div',{style:{width:160},'data-testid':'loaded'},React.createElement(MovieCard,{movie:{id:42,title:'A Long Movie Title Wrapping to Two Lines',rating:8,subtitle:'2026'}})));
    }
  `,
    }),
  );
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/favorites");
    const card = page.getByTestId("loaded").locator("article");
    await expect(card).toBeVisible();
    const before = await page
      .getByTestId("placeholder")
      .locator(":scope > div")
      .boundingBox();
    const after = await card.boundingBox();
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
  }
});

test("slider skeleton aligns its heading and cards with the loaded section", async ({
  page,
}) => {
  await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    import React from '/node_modules/.vite/deps/react.js';
    import MovieSliderSkeleton from '/src/components/ui/loading/MovieSliderSkeleton.jsx';
    import MovieSlider from '/src/pages/home/components/listing/MovieSlider.jsx';
    export default function Fixture(){return React.createElement('div',{style:{paddingTop:150}},
      React.createElement('div',{'data-testid':'placeholder'},React.createElement(MovieSliderSkeleton,{count:1})),
      React.createElement('div',{'data-testid':'loaded'},React.createElement(MovieSlider,{title:'Popular',viewAllTo:'/movies',movies:[{id:42,title:'Movie',rating:8,subtitle:'2026'}]})));
    }
  `,
    }),
  );
  for (const width of [375, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/favorites");
    await expect(page.getByRole("heading", { name: "Popular" })).toBeVisible();
    const before = await page
      .getByTestId("placeholder")
      .locator("section")
      .boundingBox();
    const after = await page
      .getByTestId("loaded")
      .locator("section")
      .boundingBox();
    expect(Math.abs(before.width - after.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(before.x - after.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
  }
});
