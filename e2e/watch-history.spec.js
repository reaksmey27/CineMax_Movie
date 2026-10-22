import { selectFilter } from "./helpers/selectFilter.js";
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
    const users = new Map();
    export const useAuth = () => {
      const uid = localStorage.getItem('test-account') || 'fan';
      if (!users.has(uid)) users.set(uid, {uid, name:'Fan'});
      return {user:users.get(uid), isAuthenticated:true, loading:false};
    };
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
  await module(
    "**/src/firebase/playbackReports.js",
    `export const submitPlaybackReport=async(db,uid,movie,server,issue)=>{
    await new Promise(resolve=>setTimeout(resolve,300));
    if(localStorage.getItem('fail-report')) throw Error('offline');
    localStorage.setItem('submitted-report',JSON.stringify({uid,movieId:movie.id,server,issue}));
  };`,
  );
  // Real provider/player/UI; replace the network storage adapter. Firestore rules
  // and durable database writes are tested separately against the emulator.
  await module(
    "**/src/firebase/watchHistory.js",
    `
    const listeners = new Set();
    const read = uid => JSON.parse(localStorage.getItem('history-'+uid)||'[]');
    const write = (uid,items) => { localStorage.setItem('history-'+uid,JSON.stringify(items)); listeners.forEach(fn=>fn()); };
    export const subscribeWatchHistory = (db,uid,cb,onError) => {
      const fn=()=>{ if(localStorage.getItem('delay-read')) return; if(localStorage.getItem('fail-read')) {onError(Error('offline')); return;} cb(read(uid)); };
      listeners.add(fn); window.addEventListener('history-refresh',fn); fn();
      return ()=>{listeners.delete(fn);window.removeEventListener('history-refresh',fn);};
    };
    export const saveWatchHistory = async (db,uid,movie,details) => { if(localStorage.getItem('fail-save')) throw Error('offline'); write(uid,[{...movie,...details,lastWatchedAt:new Date().toISOString()},...read(uid).filter(x=>x.id!==movie.id)]); };
    export const finishWatchHistory = async (db,uid,id) => write(uid,read(uid).map(x=>x.id===id?{...x,completed:true}:x));
    export const markWatchHistoryUnfinished = async (db,uid,id) => {
      if (localStorage.getItem('fail-status')) throw Error('offline');
      write(uid,read(uid).map(x=>x.id===id?{...x,completed:false}:x));
    };
    export const removeWatchHistory = async (db,uid,id) => write(uid,read(uid).filter(x=>x.id!==id));
    export const clearWatchHistory = async (db,uid) => {
      await new Promise(resolve=>setTimeout(resolve,300));
      if(localStorage.getItem('fail-clear')) throw Error('offline');
      write(uid,[]);
    };
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

test("playback report includes the movie and server, handles failure, and confirms submission", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await page.getByRole("button", { name: "Server 2", exact: true }).click();
  await page
    .getByRole("button", { name: "Report playback problem", exact: true })
    .click();
  const form = page.getByRole("form", { name: "Report playback problem" });
  await expect(form).toContainText("Example Film");
  await expect(form).toContainText("Server 2");
  await form.getByRole("radio", { name: "No sound", exact: true }).check();
  await page.evaluate(() => localStorage.setItem("fail-report", "1"));
  await form
    .getByRole("button", { name: "Submit report", exact: true })
    .click();
  await expect(
    form.getByRole("button", { name: "Submitting...", exact: true }),
  ).toBeDisabled();
  await expect(form.getByRole("alert")).toContainText(
    "Could not submit the report",
  );
  await page.evaluate(() => localStorage.removeItem("fail-report"));
  await form.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(form.getByRole("status")).toHaveText(
    "Report submitted. Thank you.",
  );
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("submitted-report")),
    ),
  ).toEqual({ uid: "fan", movieId: 42, server: "Server 2", issue: "no-sound" });
  await expect(
    form.getByRole("button", { name: "Submit report", exact: true }),
  ).toHaveCount(0);
});

test("clear history confirms, cancels, reports failures and retries", async ({
  page,
}) => {
  await fixture(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "history-fan",
      JSON.stringify([
        {
          id: 42,
          title: "Example Film",
          lastWatchedAt: "2026-01-01",
          server: "Server 1",
        },
      ]),
    );
    localStorage.setItem("fail-clear", "1");
  });
  await page.goto("/history");
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Clear watch history?" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Clear history", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Clearing...", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText(
    "Could not clear watch history",
  );
  await expect(page.locator("article")).toHaveCount(1);
  await page.evaluate(() => localStorage.removeItem("fail-clear"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Clear watch history?" }),
  ).toBeHidden();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("history-fan"))),
  ).toEqual([]);
});

test("history shows skeletons, reports a load error and retries to an empty collection", async ({
  page,
}) => {
  await fixture(page);
  await page.addInitScript(() => localStorage.setItem("delay-read", "1"));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  await expect(page.getByRole("status")).toContainText("Loading History");
  await expect(
    page.locator('[aria-busy="true"][aria-label="Loading History"]'),
  ).toBeVisible();
  await page.evaluate(() => {
    localStorage.removeItem("delay-read");
    localStorage.setItem("fail-read", "1");
    window.dispatchEvent(new Event("history-refresh"));
  });
  await expect(page.getByRole("alert")).toHaveText(
    "Could not load watch history.",
  );
  await page.evaluate(() => localStorage.removeItem("fail-read"));
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByText("Movies you start watching will appear here."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse Movies", exact: true }),
  ).toHaveAttribute("href", "/movies");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("history combines search, status, sorting and live watched updates", async ({
  page,
}) => {
  await fixture(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      "history-fan",
      JSON.stringify([
        {
          id: 1,
          title: "Zodiac",
          completed: false,
          lastWatchedAt: "2026-10-22T00:00:00.000Z",
        },
        {
          id: 2,
          title: "Alien",
          completed: true,
          lastWatchedAt: "2026-10-20T00:00:00.000Z",
        },
        {
          id: 3,
          title: "Aliens",
          completed: false,
          lastWatchedAt: "2026-10-21T00:00:00.000Z",
        },
      ]),
    ),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  const library = page.getByRole("region", { name: "History", exact: true });
  const titles = library.locator("article h3");
  await expect(titles).toHaveText(["Zodiac", "Aliens", "Alien"]);
  await library.getByLabel("Search watch history").fill("  ALIEN ");
  await expect(titles).toHaveText(["Aliens", "Alien"]);
  await selectFilter(library.getByLabel("Watch status"), "unfinished");
  await expect(titles).toHaveText(["Aliens"]);
  await library.getByRole("button", { name: "Mark as watched" }).click();
  await expect(library.getByRole("status")).toHaveText("Showing 0 of 3 movies");
  await expect(
    library.getByText("No saved movies match your search or status."),
  ).toBeVisible();
  await selectFilter(library.getByLabel("Watch status"), "watched");
  await expect(titles).toHaveText(["Aliens", "Alien"]);
  await selectFilter(library.getByLabel("Sort By"), "oldest");
  await expect(titles).toHaveText(["Alien", "Aliens"]);
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(titles).toHaveText(["Zodiac", "Aliens", "Alien"]);
  await expect(library.getByLabel("Search watch history")).toHaveValue("");
  await expect(library.getByLabel("Watch status")).toHaveAttribute(
    "data-value",
    "all",
  );
  await expect(library.getByLabel("Sort By")).toHaveAttribute(
    "data-value",
    "recent",
  );
  await selectFilter(library.getByLabel("Sort By"), "title");
  await expect(titles).toHaveText(["Alien", "Aliens", "Zodiac"]);
  await library.getByLabel("Search watch history").fill("missing title");
  await expect(titles).toHaveCount(0);
  await library.getByRole("button", { name: "Reset filters" }).click();
  await expect(titles).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("undo watched preserves progress, updates filters and restores Continue watching", async ({
  page,
}) => {
  await fixture(page);
  await page.addInitScript(() => {
    if (!localStorage.getItem("history-fan"))
      localStorage.setItem(
        "history-fan",
        JSON.stringify([
          {
            id: 42,
            title: "Example Film",
            completed: true,
            positionSeconds: 125,
            durationSeconds: 7200,
            server: "Server 4",
            lastWatchedAt: "2026-10-20T00:00:00.000Z",
          },
        ]),
      );
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/history");
  await selectFilter(page.getByLabel("Watch status"), "watched");
  await page.evaluate(() => localStorage.setItem("fail-status", "1"));
  await page.getByRole("button", { name: "Mark as unfinished" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not save watch history.",
  );
  await expect(
    page.getByRole("button", { name: "Mark as unfinished" }),
  ).toBeEnabled();
  await page.evaluate(() => localStorage.removeItem("fail-status"));
  await page.getByRole("button", { name: "Mark as unfinished" }).click();
  await expect(page.locator("article")).toHaveCount(0);
  await selectFilter(page.getByLabel("Watch status"), "unfinished");
  await expect(page.locator("article")).toContainText("2:05 / 2:00:00");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mark as watched" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue watching" }),
  ).toHaveCount(0);
  await page.goto("/history");
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
});

test("signed-in account pages fit small and tablet screens", async ({
  page,
}) => {
  await fixture(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/profile",
    "/favorites",
    "/watchlist",
    "/history",
    "/notifications",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    for (const width of [320, 640, 768, 1280]) {
      await page.setViewportSize({ width, height: 600 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBe(true);
    }
  }
});

for (const language of ["en", "km"]) {
  test(`history fits phones, tablets and desktops in ${language}`, async ({
    page,
  }) => {
    await fixture(page);
    await page.addInitScript((language) => {
      localStorage.setItem("cinemax_language", language);
      localStorage.setItem(
        "history-fan",
        JSON.stringify(
          Array.from({ length: 6 }, (_, index) => ({
            id: index + 1,
            title:
              index === 0
                ? "AReallyLongMovieTitleWithoutSpacesThatMustNotOverflowTheCard"
                : "ភាពយន្តដែលអ្នកចង់បន្តមើលនៅថ្ងៃស្អែក",
            posterImage: "/images/logo.png",
            positionSeconds: 125,
            durationSeconds: 7200,
            completed: false,
            lastWatchedAt: "2026-10-22T00:00:00.000Z",
            server: "Server 4",
          })),
        ),
      );
    }, language);
    await page.goto("/history");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      language === "km" ? "ប្រវត្តិមើល" : "History",
    );
    for (const width of [320, 390, 768, 1024, 1280, 1536, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("article")).toHaveCount(6);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `page overflow at ${width}`,
      ).toBe(true);
      expect(
        await page
          .locator("article")
          .evaluateAll((cards) =>
            cards.every((card) => card.scrollWidth <= card.clientWidth),
          ),
        `card overflow at ${width}`,
      ).toBe(true);
      await expect
        .poll(
          () =>
            page
              .locator("article button")
              .evaluateAll((buttons) =>
                buttons.every(
                  (button) => button.getBoundingClientRect().height >= 44,
                ),
              ),
          { message: `touch targets at ${width}` },
        )
        .toBe(true);
    }
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.locator('[aria-controls="mobile-navigation"]').click();
    await expect(page.locator("#mobile-navigation")).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
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
  ).toHaveCount(0);
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
