import { expect, test } from "@playwright/test";

async function fixture(page) {
  const module = (pattern, body) =>
    page.route(pattern, (route) =>
      route.fulfill({ contentType: "application/javascript", body }),
    );
  await module(
    "**/src/context/AuthContext.js",
    `
    export const AuthProvider = ({children}) => children;
    export const useAuth = () => ({user:{uid:localStorage.getItem('test-account') || 'fan', name:'Fan'}, isAuthenticated:true, loading:false});
  `,
  );
  await module(
    "**/src/context/FavoritesContext.jsx",
    `export const FavoritesProvider=({children})=>children; export const useFavorites=()=>({favorites:[],isFavorite:()=>false,isSavingFavorite:()=>false,toggleFavorite:()=>{}});`,
  );
  await module(
    "**/src/context/WatchlistContext.jsx",
    `export const WatchlistProvider=({children})=>children; export const useWatchlist=()=>({watchlist:[],isInWatchlist:()=>false,isSavingToWatchlist:()=>false,toggleWatchlist:()=>{}});`,
  );
  await module("**/src/firebase/firestore.js", "export const db = {};");
  // Real provider/player/UI; replace the network storage adapter. Firestore rules
  // and durable database writes are tested separately against the emulator.
  await module(
    "**/src/firebase/watchHistory.js",
    `
    const listeners = new Set();
    const read = uid => JSON.parse(localStorage.getItem('history-'+uid)||'[]');
    const write = (uid,items) => { localStorage.setItem('history-'+uid,JSON.stringify(items)); listeners.forEach(fn=>fn()); };
    export const subscribeWatchHistory = (db,uid,cb) => { const fn=()=>cb(read(uid)); listeners.add(fn); fn(); return ()=>listeners.delete(fn); };
    export const saveWatchHistory = async (db,uid,movie,details) => { if(localStorage.getItem('fail-save')) throw Error('offline'); write(uid,[{...movie,...details,lastWatchedAt:new Date().toISOString()},...read(uid).filter(x=>x.id!==movie.id)]); };
    export const finishWatchHistory = async (db,uid,id) => write(uid,read(uid).map(x=>x.id===id?{...x,completed:true}:x));
    export const removeWatchHistory = async (db,uid,id) => write(uid,read(uid).filter(x=>x.id!==id));
  `,
  );
  await page.route("https://api.themoviedb.org/**", (route) =>
    route.fulfill({
      json: route.request().url().includes("/movie/42?")
        ? {
            id: 42,
            title: "Example Film",
            release_date: "2024-01-01",
            overview: "A test movie.",
            poster_path: "/poster.jpg",
            vote_average: 7.5,
            runtime: 100,
            genres: [],
            videos: { results: [] },
            credits: { cast: [], crew: [] },
          }
        : { results: [] },
    }),
  );
  await page.route("https://image.tmdb.org/**", (route) => route.abort());
  await page.route(/https:\/\/vidsrc[^/]*\/embed\/.*/, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><body>Test player</body></html>",
    }),
  );
}

test("save a movie, return after reload, resume progress, finish and remove", async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(
    page.getByText(
      "This movie is saved in History. This server does not support exact-time resume.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Server 4", exact: true }).click();
  const player = page.getByTitle("Cinema Player");
  await expect(player).toHaveAttribute("src", /vidsrc.sh/);
  await expect
    .poll(() =>
      page.frames().some((frame) => frame.url().includes("vidsrc.sh")),
    )
    .toBe(true);
  await page
    .frames()
    .find((frame) => frame.url().includes("vidsrc.sh"))
    .evaluate(() =>
      parent.postMessage(
        {
          type: "PLAYER_EVENT",
          data: {
            player_info: { tmdb: 42, mediaType: "movie" },
            player_status: "paused",
            player_progress: 125,
            player_duration: 7200,
          },
        },
        "*",
      ),
    );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("history-fan"))[0].positionSeconds,
      ),
    )
    .toBe(125);
  await page.goto("/history");
  await expect(page.locator("article")).toContainText("2:05 / 2:00:00");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toBeVisible();
  await expect(page.locator("article")).toContainText("Example Film");
  await page.goto("/history");
  await page.reload();
  await page
    .locator("article")
    .getByRole("link", { name: "Continue watching" })
    .click();
  await page
    .getByRole("button", { name: "Continue watching", exact: true })
    .click();
  await expect(page.getByTitle("Cinema Player")).toHaveAttribute(
    "src",
    /startAt=125/,
  );
  await page.goto("/history");
  await page.getByRole("button", { name: "Mark as watched" }).click();
  await expect(page.locator("article")).toContainText("Watched");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toHaveCount(0);
  await page.goto("/history");
  await page.reload();
  await expect(page.locator("article")).toContainText("Watched");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => localStorage.setItem("test-account", "other"));
  await page.reload();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("test-account"));
  await page.reload();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
});

test("failed writes show a retry and save after recovery", async ({ page }) => {
  await fixture(page);
  await page.goto("/movie/42");
  await page.evaluate(() => localStorage.setItem("fail-save", "1"));
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not save watch history.",
  );
  await page.evaluate(() => localStorage.removeItem("fail-save"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByText("Could not save watch history.")).toHaveCount(0);
  await page.goto("/history");
  await expect(page.locator("article")).toContainText("Example Film");
});
