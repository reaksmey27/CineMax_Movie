// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const DEFAULT_TITLE =
  "CineMax Movies | Discover Trending, Upcoming, and Favorite Films";

export const DEFAULT_DESCRIPTION =
  "CineMax helps you discover trending movies, explore upcoming releases, browse by genre, save favorites, and build a personal watchlist in one cinematic experience.";

export const MOVIE_DETAIL_TITLE =
  "Movie Details | Watch Trailers and Explore Films on CineMax";

export const MOVIE_DETAIL_DESCRIPTION =
  "Explore movie details, story overviews, trailers, and key information for your next pick on CineMax.";

export const ROUTE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/movies": {
    title: "Browse Movies | Explore the CineMax Movie Catalog",
    description:
      "Browse the CineMax movie catalog to discover films by mood, genre, and popularity before choosing your next watch.",
  },
  "/trending": {
    title: "Trending Movies | See What Is Popular on CineMax",
    description:
      "See which movies are trending right now on CineMax and keep up with the most popular titles movie fans are watching.",
  },
  "/upcoming": {
    title: "Upcoming Movies | Find New Releases on CineMax",
    description:
      "Explore upcoming movie releases on CineMax and stay ready for the newest films heading to screens soon.",
  },
  "/favorites": {
    title: "Favorite Movies | Your Saved Picks on CineMax",
    description:
      "Revisit the movies you love with your CineMax favorites list and keep your top picks in one place.",
  },
  "/watchlist": {
    title: "Movie Watchlist | Saved Movies Ready to Watch on CineMax",
    description:
      "Track what to watch next with your CineMax watchlist and save movies for the perfect movie night.",
  },
  "/profile": {
    title: "Your Profile | Manage Your CineMax Account",
    description:
      "Manage your CineMax profile, review your saved collections, and keep your movie account up to date.",
  },
  "/login": {
    title: "Log In | Access Your CineMax Movie Account",
    description:
      "Log in to CineMax to access your movie watchlist, favorites, and personalized account experience.",
  },
  "/signup": {
    title: "Sign Up | Create Your CineMax Movie Account",
    description:
      "Create your CineMax account to save favorite movies, build a watchlist, and enjoy a personalized movie hub.",
  },
  "/register": {
    title: "Register | Create Your CineMax Movie Account",
    description:
      "Register a CineMax account to save favorite movies, build a watchlist, and enjoy a personalized movie hub.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const setMetaTag = (selector, content) => {
  document.head.querySelector(selector)?.setAttribute("content", content);
};

export const applyPageMeta = (title, description) => {
  document.title = title;
  setMetaTag('meta[name="description"]', description);
  setMetaTag('meta[property="og:title"]', title);
  setMetaTag('meta[property="og:description"]', description);
  setMetaTag('meta[name="twitter:title"]', title);
  setMetaTag('meta[name="twitter:description"]', description);
};
