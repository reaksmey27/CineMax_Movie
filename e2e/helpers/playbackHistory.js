// Mock network adapters while keeping the real player, history provider, and UI.
// Firestore persistence and security rules are covered separately in tests/.
export async function setupPlaybackHistory(page) {
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
    `export const submitPlaybackReport=async(db,uid,movie,server,issue,details)=>{
    await new Promise(resolve=>setTimeout(resolve,300));
    if(localStorage.getItem('fail-report')) throw Error('offline');
    localStorage.setItem('submitted-report',JSON.stringify({uid,movieId:movie.id,server,issue,details}));
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
      json: /\/movie\/(42|43)\?/.test(route.request().url())
        ? {
            id: Number(
              new URL(route.request().url()).pathname.split("/").at(-1),
            ),
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
