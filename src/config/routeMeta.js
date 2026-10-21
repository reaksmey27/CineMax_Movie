// ─── SEO Metadata: default titles & descriptions ──────────────────────────────

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
  "/notifications": {
    title: "Notifications | Your CineMax Activity",
    description:
      "Review recent CineMax notifications about your movie collections and account activity.",
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
  "/privacy": {
    title: "Privacy Policy | CineMax",
    description:
      "How CineMax collects, stores, and protects your data: account details, saved movies, local preferences, and your choices.",
  },
  "/terms": {
    title: "Terms of Use | CineMax",
    description:
      "The terms that apply when you use CineMax, including acceptable use, third-party content, disclaimers, and contact details.",
  },
};

export const SITE_URL = "https://smey-dev.site";
export const DEFAULT_IMAGE = `${SITE_URL}/images/logo.png`;
export const PUBLIC_ROUTES = [
  "/",
  "/movies",
  "/trending",
  "/upcoming",
  "/privacy",
  "/terms",
];

// ─── getPageMeta: meta for a route path ───────────────────────────────────────

export const getPageMeta = (pathname, search = "") => {
  const path = pathname.replace(/\/+$/, "") || "/";
  const moviePage = /^\/movie\/\d+$/.test(path);
  const known = Boolean(ROUTE_META[path]) || moviePage;
  const base = moviePage
    ? { title: MOVIE_DETAIL_TITLE, description: MOVIE_DETAIL_DESCRIPTION }
    : ROUTE_META[path] || {
        title: "Page not found | CineMax",
        description:
          "This page could not be found. Explore the CineMax movie catalog to find your next movie.",
      };
  const meta = {
    ...base,
    canonical: `${SITE_URL}${path}`,
    image: DEFAULT_IMAGE,
    imageAlt: "CineMax logo",
    type: "website",
    noindex: !known || (!PUBLIC_ROUTES.includes(path) && !moviePage),
    structuredData: null,
  };
  const params = new URLSearchParams(search);
  if (path === "/movies") {
    const canonicalParams = new URLSearchParams();
    const collection = params.get("collection");
    if (["top-rated", "now-playing"].includes(collection)) {
      canonicalParams.set("collection", collection);
      const label = collection === "top-rated" ? "Top Rated" : "Now Playing";
      meta.title = `${label} Movies | CineMax`;
      meta.description = `Explore ${label.toLowerCase()} movies on CineMax. Browse posters, ratings, release years, and trailers to choose your next film.`;
    }
    for (const key of ["q", "genre", "year", "rating", "sort"]) {
      if (params.get(key)) {
        canonicalParams.set(key, params.get(key));
        meta.noindex = true;
      }
    }
    const page = Number(params.get("page"));
    if (Number.isInteger(page) && page > 1) {
      canonicalParams.set("page", String(page));
      meta.title = meta.title.replace(" |", ` - Page ${page} |`);
    }
    if (params.get("q")) meta.title = `Search Movies | CineMax`;
    canonicalParams.sort();
    if (canonicalParams.size) meta.canonical += `?${canonicalParams}`;
  }
  if (path === "/register") meta.canonical = `${SITE_URL}/signup`;
  if (path === "/")
    meta.structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "CineMax",
      url: `${SITE_URL}/`,
      description: DEFAULT_DESCRIPTION,
    };
  return meta;
};

// ─── getMovieMeta: meta for a movie page ──────────────────────────────────────

export const getMovieMeta = (movie) => {
  const meta = getPageMeta(`/movie/${movie.id}`);
  const year = movie.release_date?.slice(0, 4);
  const title = movie.title || movie.name || "Movie";
  meta.title = `${title}${year ? ` (${year})` : ""} - Details & Trailer | CineMax`;
  meta.description =
    movie.overview?.trim().replace(/\s+/g, " ").slice(0, 160) ||
    `Explore ${title} on CineMax, including movie information, genres, and available trailers.`;
  const imagePath = movie.backdrop_path || movie.poster_path;
  meta.image = imagePath
    ? `https://image.tmdb.org/t/p/w780${imagePath}`
    : DEFAULT_IMAGE;
  meta.imageAlt = imagePath ? `${title} artwork` : "CineMax logo";
  meta.type = "video.movie";
  meta.structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: title,
    url: meta.canonical,
    description: movie.overview || meta.description,
    ...(imagePath ? { image: meta.image } : {}),
    ...(movie.release_date ? { datePublished: movie.release_date } : {}),
    ...(movie.runtime > 0 ? { duration: `PT${movie.runtime}M` } : {}),
    ...(movie.genres?.length
      ? { genre: movie.genres.map((genre) => genre.name) }
      : {}),
  };
  return meta;
};

// ─── getMetaTags: convert meta to tag pairs ───────────────────────────────────

export const getMetaTags = (meta) =>
  [
    ["name", "description", meta.description],
    [
      "name",
      "robots",
      meta.noindex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large",
    ],
    ["property", "og:site_name", "CineMax"],
    ["property", "og:title", meta.title],
    ["property", "og:description", meta.description],
    ["property", "og:type", meta.type],
    ["property", "og:url", meta.canonical],
    ["property", "og:image", meta.image],
    ["property", "og:image:alt", meta.imageAlt],
    [
      "name",
      "twitter:card",
      meta.image === DEFAULT_IMAGE ? "summary" : "summary_large_image",
    ],
    ["name", "twitter:title", meta.title],
    ["name", "twitter:description", meta.description],
    ["name", "twitter:image", meta.image],
    ["name", "twitter:image:alt", meta.imageAlt],
  ].filter(([, , value]) => value);

// ─── applyPageMeta: write meta tags to document ───────────────────────────────

export const applyPageMeta = (meta) => {
  document.title = meta.title;
  for (const [attribute, key, value] of getMetaTags(meta)) {
    let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attribute, key);
      document.head.append(tag);
    }
    tag.setAttribute("content", value);
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = meta.canonical;
  document.getElementById("page-structured-data")?.remove();
  if (meta.structuredData) {
    const script = document.createElement("script");
    script.id = "page-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(meta.structuredData).replace(
      /</g,
      "\\u003c",
    );
    document.head.append(script);
  }
};
