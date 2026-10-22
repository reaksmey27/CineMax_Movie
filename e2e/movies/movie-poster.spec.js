import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";

test("posters load without resizing, recover after source changes, and handle missing images", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8WQAAAAASUVORK5CYII=",
    "base64",
  );
  await page.route("**/slow-poster.png", async (route) => {
    await gate;
    await route.fulfill({ contentType: "image/png", body: png });
  });
  await page.route("**/broken-poster.png", (route) =>
    route.fulfill({ status: 404, body: "Missing" }),
  );
  await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `import React from '/node_modules/.vite/deps/react.js';
      import MoviePoster from '/src/components/ui/MoviePoster.jsx';
      export default function Fixture() {
        const [src,setSrc] = React.useState('/slow-poster.png');
        return React.createElement('main', {style:{paddingTop:140}},
          React.createElement('div', {style:{width:120,height:180},'data-testid':'poster'}, React.createElement(MoviePoster,{src})),
          React.createElement('div', {style:{width:120,height:150},'data-testid':'missing'}, React.createElement(MoviePoster,{})),
          React.createElement('button',{onClick:()=>setSrc('/broken-poster.png')},'Break poster'),
          React.createElement('button',{onClick:()=>setSrc('/slow-poster.png')},'Restore poster'));
      }`,
    }),
  );
  await page.goto("/favorites", { waitUntil: "domcontentloaded" });
  const poster = page.getByTestId("poster").locator("[data-poster-state]");
  await expect(poster).toHaveAttribute("data-poster-state", "loading");
  const bounds = await poster.boundingBox();
  await expect(poster.locator(".skeleton-shimmer")).toBeVisible();
  await expect(page.getByTestId("missing")).toContainText("Poster unavailable");
  release();
  await expect(poster).toHaveAttribute("data-poster-state", "loaded");
  await expect(poster.locator("img")).toHaveCSS("opacity", "1");
  expect(await poster.boundingBox()).toEqual(bounds);
  await page.getByRole("button", { name: "Break poster" }).click();
  await expect(poster).toHaveAttribute("data-poster-state", "error");
  await expect(poster).toContainText("Poster unavailable");
  await expect(poster.locator("img")).toHaveCount(0);
  expect(await poster.boundingBox()).toEqual(bounds);
  await page.getByRole("button", { name: "Restore poster" }).click();
  await expect(poster).toHaveAttribute("data-poster-state", "loaded");
  expect(await poster.boundingBox()).toEqual(bounds);
});
