import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  applyPageMeta,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  MOVIE_DETAIL_DESCRIPTION,
  MOVIE_DETAIL_TITLE,
  ROUTE_META,
} from "../config/routeMeta";

const RouteTitleManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isMovieDetail = pathname.startsWith("/movie/");
    const { title, description } = isMovieDetail
      ? { title: MOVIE_DETAIL_TITLE, description: MOVIE_DETAIL_DESCRIPTION }
      : (ROUTE_META[pathname] ?? {
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
        });

    applyPageMeta(title, description);
  }, [pathname]);

  return null;
};

export default RouteTitleManager;
