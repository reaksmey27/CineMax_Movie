import { expect, test } from "@playwright/test";

for (const language of ["en", "km"]) {
  test(`long filter selections remain readable in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.addInitScript(
      (language) => localStorage.setItem("cinemax_language", language),
      language,
    );
    await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
      import React from '/node_modules/.vite/deps/react.js';
      import FilterSelect from '/src/components/movies/FilterSelect.jsx';
      export default function Fixture() {
        return React.createElement('section',{style:{paddingTop:140,margin:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},
          React.createElement(FilterSelect,{label:'Sort By',value:'saved',onChange:()=>{},options:[{value:'saved',label:'Recently saved'}]}),
          React.createElement(FilterSelect,{label:'Country',value:'long',onChange:()=>{},options:[{value:'long',label:'AnUnbrokenSelectionThatMustRemainFullyReadable'}]}));
      }
    `,
      }),
    );
    await page.goto("/favorites");
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    const triggers = page.locator('button[aria-haspopup="listbox"]');
    await expect(triggers).toHaveCount(2);
    for (const trigger of await triggers.all()) {
      const label = trigger.locator("span");
      await expect(label).toHaveCSS("white-space", "normal");
      expect(
        await label.evaluate(
          (el) =>
            el.scrollWidth <= el.clientWidth + 1 &&
            el.scrollHeight <= el.clientHeight + 1,
        ),
      ).toBe(true);
      const text = await label.boundingBox();
      const icon = await trigger.locator("svg").boundingBox();
      expect(text.x + text.width).toBeLessThanOrEqual(icon.x);
      await trigger.click();
      const option = page.getByRole("option");
      await expect(option).toBeVisible();
      expect(
        await option.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      await page.keyboard.press("Escape");
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
  });
}
