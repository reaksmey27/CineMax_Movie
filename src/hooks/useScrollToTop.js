import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// ─── useScrollToTop: scroll to top on route change ────────────────────────────

const useScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, navType]);
};

export default useScrollToTop;
