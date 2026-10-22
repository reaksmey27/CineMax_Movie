import { expect, test } from "@playwright/test";

test("watchlist, profile and accessible labels update live and preserve language after reload", async ({
  page,
}) => {
  await page.route("**/src/pages/watchlist/WatchlistPage.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
      import React from '/node_modules/.vite/deps/react.js';
      import WatchlistLibrary from '/src/pages/watchlist/WatchlistLibrary.jsx';
      import ProfileCollection from '/src/pages/profile/components/ProfileCollection.jsx';
      export default function Fixture() {
        return React.createElement('main', { style: { padding: '120px 16px 40px' } },
          React.createElement(WatchlistLibrary, { movies: [{ id: 1, title: 'Original Movie Title', rating: '8' }],
            isSaving: () => false, setWatched: () => {} }),
          React.createElement(ProfileCollection));
      }
    `,
    }),
  );
  await page.goto("/watchlist");
  const selector = page
    .getByTestId("language-selector")
    .filter({ visible: true });
  await selector.locator("summary").click();
  await selector.getByRole("button", { name: "Français", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(
    page.getByLabel("Rechercher dans la liste à voir", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Vu : Original Movie Title",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ajouter aux favoris", exact: true }),
  ).toBeAttached();
  await expect(
    page.getByText("Faites une place à vos favoris", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Films affichés : 1 sur 1" }),
  ).toBeVisible();
  await selector.locator("summary").click();
  await selector.getByRole("button", { name: "ខ្មែរ", exact: true }).click();
  await expect(
    page.getByLabel("ស្វែងរកក្នុងបញ្ជីត្រូវមើល", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await expect(
    page.getByLabel("ស្វែងរកក្នុងបញ្ជីត្រូវមើល", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Original Movie Title", exact: true }),
  ).toBeVisible();
});

test("movie credits and related movie states use the selected language", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("cinemax_language", "fr"),
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({
      json: route.request().url().includes("recommendations")
        ? { results: [] }
        : {
            id: 42,
            title: "Original Movie Title",
            genres: [],
            credits: {
              cast: [
                {
                  id: 1,
                  name: "Original Actor Name",
                  character: "Original Character",
                },
              ],
              crew: [{ name: "Original Director Name", job: "Director" }],
            },
          },
    }),
  );
  await page.goto("/movie/42");
  await expect(
    page.getByRole("heading", { name: "Distribution et équipe" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Films associés" }),
  ).toBeVisible();
  await expect(
    page.getByText("Aucun film associé disponible pour le moment.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Original Actor Name", { exact: true }),
  ).toBeVisible();
});
