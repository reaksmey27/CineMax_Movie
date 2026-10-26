import { expect, test } from "@playwright/test";
import km from "../../src/i18n/locales/km.js";

for (const language of ["en", "km"]) {
  test(`remove individual movie filters in ${language} without losing the search`, async ({ page }) => {
    await page.addInitScript(code => localStorage.setItem("cinemax_language", code), language);
    await page.route("https://api.themoviedb.org/**", route => route.fulfill({ json: { genres: [{ id: 28, name: "Action" }], results: [], total_pages: 0 } }));
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/movies?q=matrix&genre=28&year=2024&rating=7&runtime=short&sort=vote_average.desc&page=2");
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    const group = page.getByRole("group", { name: language === "km" ? km["Active filters"] : "Active filters", exact: true });
    await expect(group.getByRole("button")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const remaining = { genre: "28", year: "2024", rating: "7", runtime: "short", sort: "vote_average.desc" };
    for (const key of Object.keys(remaining)) {
      const chip = group.getByRole("button").first();
      await chip.focus();
      await chip.press("Enter");
      delete remaining[key];
      await expect.poll(() => new URL(page.url()).searchParams.has(key)).toBe(false);
      const params = new URL(page.url()).searchParams;
      expect(params.get("q")).toBe("matrix");
      expect(params.get("page")).toBe("1");
      for (const [other, value] of Object.entries(remaining)) expect(params.get(other)).toBe(value);
    }
    await expect(group).toHaveCount(0);
    await page.reload();
    await expect(group).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get("q")).toBe("matrix");
  });
}
