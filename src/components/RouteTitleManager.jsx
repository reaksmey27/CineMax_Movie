import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMeta, getPageMeta, getMovieMeta } from "../config/routeMeta";
import { tmdbService } from "../services/tmdbService";

// ─── RouteTitleManager: route-based page title ────────────────────────────────

const RouteTitleManager = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    let active = true;
    const meta = getPageMeta(pathname, search);
    applyPageMeta(meta);
    const match = pathname.match(/^\/movie\/(\d+)\/?$/);
    if (match) {
      // The service shares pending requests with the movie detail page.
      tmdbService
        .getMovieDetails(match[1])
        .then((movie) => {
          if (active && movie?.id) applyPageMeta(getMovieMeta(movie));
        })
        .catch(() => {
          if (active) applyPageMeta({ ...meta, noindex: true });
        });
    }
    return () => {
      active = false;
    };
  }, [pathname, search]);
  return null;
};
export default RouteTitleManager;
