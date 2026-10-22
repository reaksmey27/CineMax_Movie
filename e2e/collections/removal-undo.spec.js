import { expect, test } from "@playwright/test";

const original = {
  id: 42,
  title: "Saved Film",
  subtitle: "2024",
  rating: "8.0",
  savedAt: "2026-01-01T00:00:00.000Z",
  watched: true,
  server: "Server 4",
  positionSeconds: 125,
  durationSeconds: 7200,
  completed: false,
  lastWatchedAt: "2026-01-01T00:00:00.000Z",
};

async function fixture(page, collection) {
  const module = (path, body) =>
    page.route(`**/src/${path}`, (route) =>
      route.fulfill({ contentType: "application/javascript", body }),
    );
  await page.addInitScript(
    ({ collection, original }) => {
      localStorage.setItem(
        `undo-${collection}-fan`,
        JSON.stringify([original]),
      );
    },
    { collection, original },
  );
  await module(
    "context/AuthContext.js",
    `import React from '/node_modules/.vite/deps/react.js'; const {useEffect,useState}=React;
    export const AuthProvider=({children})=>children;
    const users={fan:{uid:'fan',name:'Fan'},other:{uid:'other',name:'Other'}};
    export function useAuth(){const [uid,setUid]=useState(localStorage.getItem('account')||'fan');useEffect(()=>{const fn=()=>setUid(localStorage.getItem('account')||'fan');window.addEventListener('account-change',fn);return()=>window.removeEventListener('account-change',fn)},[]);return {user:users[uid],isAuthenticated:true,loading:false};}`,
  );
  await module("firebase/firestore.js", "export const db={};");
  const storage = `const read=(c,u)=>JSON.parse(localStorage.getItem('undo-'+c+'-'+u)||'[]');
    const write=(c,u,items)=>{localStorage.setItem('undo-'+c+'-'+u,JSON.stringify(items));window.dispatchEvent(new Event('saved-change'));};`;
  for (const [folder, name, c] of [
    ["favorites", "Favorites", "favorites"],
    ["watchlist", "Watchlist", "watchlists"],
  ]) {
    await module(
      `hooks/${folder}/use${name}Sync.js`,
      `import React from '/node_modules/.vite/deps/react.js'; const {useEffect,useState}=React; ${storage}
      export default function useSync(uid){const [items,setItems]=useState(()=>read('${c}',uid));useEffect(()=>{const fn=()=>setItems(read('${c}',uid));window.addEventListener('saved-change',fn);return()=>window.removeEventListener('saved-change',fn)},[uid]);return {${folder}:items,loading:false,error:false,retry:()=>{}};}`,
    );
    await module(
      `firebase/${folder}.js`,
      `${storage}
      export async function removeFrom${name}(db,uid,id){if(localStorage.getItem('fail-remove'))throw Error('offline');write('${c}',uid,read('${c}',uid).filter(x=>x.id!==id));return true;}
      export async function addTo${name}(db,uid,movie){write('${c}',uid,[movie,...read('${c}',uid).filter(x=>x.id!==movie.id)]);}
      export async function setWatchlistWatched(){return true;}`,
    );
  }
  await module(
    "firebase/watchHistory.js",
    `${storage}
    export function subscribeWatchHistory(db,uid,cb){const fn=()=>cb(read('watchHistory',uid));fn();window.addEventListener('saved-change',fn);return()=>window.removeEventListener('saved-change',fn);}
    export async function removeWatchHistory(db,uid,id){if(localStorage.getItem('fail-remove'))throw Error('offline');write('watchHistory',uid,read('watchHistory',uid).filter(x=>x.id!==id));}
    export async function saveWatchHistory(){};export async function finishWatchHistory(){};export async function markWatchHistoryUnfinished(){};`,
  );
  await module(
    "firebase/restoreMovie.js",
    `${storage}
    export async function restoreMovie(db,uid,c,movie){if(localStorage.getItem('fail-restore'))throw Error('offline');const items=read(c,uid);if(!items.some(x=>x.id===movie.id))write(c,uid,[movie,...items]);}`,
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({ json: { results: [] } }),
  );
}

for (const [collection, path, label] of [
  ["favorites", "/favorites", "Remove from favorites"],
  ["watchlists", "/watchlist", "Remove from watchlist"],
  ["watchHistory", "/history", "Remove"],
]) {
  test(`${collection} removal supports retryable undo preserving data and account isolation`, async ({
    page,
  }) => {
    await fixture(page, collection);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(path);
    await expect(page.locator("article")).toHaveCount(1);
    await page.evaluate(() => localStorage.setItem("fail-remove", "1"));
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(0);
    await page.evaluate(() => localStorage.removeItem("fail-remove"));
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("article")).toHaveCount(0);
    await page.evaluate(() => localStorage.setItem("fail-restore", "1"));
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(
      page.getByText("Could not restore this movie. Try again.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(() => localStorage.removeItem("fail-restore"));
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(1);
    expect(
      await page.evaluate(
        (c) => JSON.parse(localStorage.getItem(`undo-${c}-fan`)),
        collection,
      ),
    ).toEqual([original]);
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => {
      localStorage.setItem("account", "other");
      window.dispatchEvent(new Event("account-change"));
    });
    await expect(
      page.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        (c) => localStorage.getItem(`undo-${c}-other`),
        collection,
      ),
    ).toBeNull();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
