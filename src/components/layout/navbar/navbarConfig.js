// ─── Constants: primary nav links ─────────────────────────────────────────────

export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Movies", path: "/movies" },
  { name: "Trending", path: "/trending" },
  { name: "Favorites", path: "/favorites" },
  { name: "Watchlist", path: "/watchlist" },
  { name: "History", path: "/history" },
  { name: "Upcoming", path: "/upcoming" },
];

// ─── Helpers: active link check & user initials ───────────────────────────────

export const checkActiveLink = (location, linkPath) => {
  if (linkPath.includes("#")) {
    const pathPart = linkPath.split("#")[0] || "/";
    const hashPart = `#${linkPath.split("#")[1]}`;

    return location.pathname === pathPart && location.hash === hashPart;
  }

  if (linkPath === "/") {
    return location.pathname === "/" && !location.hash;
  }

  return location.pathname === linkPath;
};

export const getUserInitial = (user) => {
  const value = user?.name || user?.email || "";

  return value.charAt(0).toUpperCase();
};
