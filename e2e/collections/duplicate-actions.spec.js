import { expect, test } from "@playwright/test";

for (const action of [
  "favorite-add",
  "favorite-remove",
  "watchlist-add",
  "watchlist-remove",
  "watched",
]) {
  test(`${action} ignores duplicate calls and unlocks after failure`, async ({
    page,
  }) => {
    await page.route("**/src/firebase/firestore.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: "export const db = {};",
      }),
    );
    const adapter = `async function write(){ window.writeCount=(window.writeCount||0)+1; await new Promise(resolve=>{window.releaseWrite=resolve;}); if(window.failWrite) throw Error('test failure'); return true; }
   export {write as addToFavorites,write as removeFromFavorites,write as addToWatchlist,write as removeFromWatchlist,write as setWatchlistWatched};`;
    for (const file of ["favorites", "watchlist"])
      await page.route("**/src/firebase/" + file + ".js", (route) =>
        route.fulfill({ contentType: "application/javascript", body: adapter }),
      );
    await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
   import React from '/node_modules/.vite/deps/react.js';
   import useFavoritesActions from '/src/hooks/favorites/useFavoritesActions.js';
   import useWatchlistActions from '/src/hooks/watchlist/useWatchlistActions.js';
   const movie={id:42,title:'Test Movie'};
   export default function Fixture(){
    const favorites=useFavoritesActions({favorites:${action === "favorite-remove" ? "[movie]" : "[]"},userId:'test',onRequireSignIn:()=>{},showNotification:()=>{}});
    const watchlist=useWatchlistActions({watchlist:[movie],userId:'test',onRequireSignIn:()=>{},showNotification:()=>{}});
    const run=()=>${action === "favorite-add" ? "favorites.toggleFavorite(movie)" : action === "favorite-remove" ? "favorites.removeFromFavorites(42)" : action === "watchlist-add" ? "watchlist.addToWatchlist({...movie,id:43})" : action === "watchlist-remove" ? "watchlist.removeFromWatchlist(42)" : "watchlist.setWatched(movie,true)"};
    const busy=${action.startsWith("favorite") ? "favorites.isSavingFavorite(42)" : `watchlist.isSavingToWatchlist(${action === "watchlist-add" ? 43 : 42})`};
    return React.createElement('button',{style:{marginTop:180},disabled:busy,onClick:()=>{run();run();}},busy?'Saving':'Run');
   }
  `,
      }),
    );
    await page.goto("/favorites");
    await page.evaluate(() => {
      window.failWrite = true;
    });
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.writeCount)).toBe(1);
    await expect(
      page.getByRole("button", { name: "Saving", exact: true }),
    ).toBeDisabled();
    await page.evaluate(() => window.releaseWrite());
    await expect(
      page.getByRole("button", { name: "Run", exact: true }),
    ).toBeEnabled();
    await page.evaluate(() => {
      window.failWrite = false;
    });
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.writeCount)).toBe(2);
    await page.evaluate(() => window.releaseWrite());
    await expect(
      page.getByRole("button", { name: "Run", exact: true }),
    ).toBeEnabled();
  });
}
