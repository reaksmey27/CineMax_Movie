import { expect, test } from "@playwright/test";

const selector = (page) =>
  page.getByTestId("language-selector").filter({ visible: true });
async function choose(page, name) {
  const menu = selector(page);
  if (!(await menu.getAttribute("open"))) {
    // An open details element uses an empty string for its open attribute.
    if (!(await menu.evaluate((element) => element.open)))
      await menu.locator("summary").click();
  }
  await menu.getByRole("button", { name, exact: true }).click();
}

test("downloads only selected languages and reuses loaded translations", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("/i18n/locales/"))
      requests.push(new URL(request.url()).pathname);
  });
  await page.goto("/watchlist");
  await expect(selector(page).locator("summary")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(requests).toEqual([]);
  await choose(page, "Français");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  expect(requests).toEqual(["/src/i18n/locales/fr.js"]);
  await choose(page, "English");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await choose(page, "Français");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  expect(requests).toHaveLength(1);
});

test("a slow earlier selection cannot replace the latest language", async ({
  page,
}) => {
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const requested = new Promise((resolve) => {
    started = resolve;
  });
  await page.route("**/i18n/locales/fr.js", async (route) => {
    started();
    await held;
    await route.continue();
  });
  await page.goto("/watchlist");
  await choose(page, "Français");
  await requested;
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await choose(page, "Deutsch");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  const loaded = page.waitForResponse("**/i18n/locales/fr.js");
  release();
  await loaded;
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  expect(
    await page.evaluate(() => localStorage.getItem("cinemax_language")),
  ).toBe("de");
});

test("failed saved language preserves the preference and offers recovery", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("cinemax_language", "fr"),
  );
  await page.route("**/i18n/locales/fr.js", (route) => route.abort());
  await page.goto("/watchlist");
  await expect(selector(page).getByRole("alert")).toContainText(
    "Could not load this language.",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(
    await page.evaluate(() => localStorage.getItem("cinemax_language")),
  ).toBe("fr");
  await page.unroute("**/i18n/locales/fr.js");
  await selector(page)
    .getByRole("button", { name: "Try again", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(selector(page).getByRole("alert")).toHaveCount(0);
});
