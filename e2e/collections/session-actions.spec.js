import { expect, test } from "@playwright/test";

for (const collection of ["favorites", "watchlist"]) {
  for (const fails of [false, true]) {
    test(`${collection} ignores ${fails ? "failed" : "successful"} writes from an ended session`, async ({
      page,
    }) => {
      const name = collection === "favorites" ? "Favorites" : "Watchlist";
      await page.route("**/src/firebase/firestore.js", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: "export const db={};",
        }),
      );
      await page.route(`**/src/firebase/${collection}.js`, (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: `
    export async function addTo${name}(db,uid,movie){window.writeOwner=uid; await new Promise(resolve=>{window.releaseOldWrite=resolve;}); ${fails ? "throw Error('test failure');" : ""}}
   `,
        }),
      );
      await page.route("**/src/pages/favorites/FavoritesPage.jsx", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: `
    import React from '/node_modules/.vite/deps/react.js';
    import useActions from '/src/hooks/${collection}/use${name}Actions.js';
    const notify=()=>{window.staleNotifications=(window.staleNotifications||0)+1;};
    function Session({uid}) {
      const actions=useActions({${collection}:[],userId:uid,onRequireSignIn:()=>{},showNotification:notify});
      return React.createElement('button',{onClick:()=>actions.${collection === "favorites" ? "toggleFavorite" : "addToWatchlist"}({id:42,title:'Private Movie'})},'Save '+uid);
    }
    export default function Fixture(){
      const [uid,setUid]=React.useState('first');
      return React.createElement('section',{style:{paddingTop:180}},
        React.createElement(Session,{key:uid,uid}),
        React.createElement('button',{onClick:()=>setUid('second')},'Switch account'));
    }
   `,
        }),
      );
      await page.goto("/favorites");
      await page.getByRole("button", { name: "Save first" }).click();
      await expect
        .poll(() => page.evaluate(() => window.writeOwner))
        .toBe("first");
      await page.getByRole("button", { name: "Switch account" }).click();
      await expect(
        page.getByRole("button", { name: "Save first" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Save second" }),
      ).toBeVisible();
      await page.evaluate(async () => {
        window.releaseOldWrite();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(await page.evaluate(() => window.staleNotifications || 0)).toBe(0);
    });
  }
}
