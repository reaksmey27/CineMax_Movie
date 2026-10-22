import { Link } from "react-router-dom";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import MovieCard from "../../../components/ui/MovieCard";
import { useLanguage } from "../../../context/LanguageContext";

// ─── Helpers: heading id from slider title ────────────────────────────────────

const toHeadingId = (title) =>
  `slider-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

// ─── Sub-components: scroll arrow buttons ─────────────────────────────────────

const NAV_BTN_CLASS =
  "absolute bottom-10 top-23 z-40 hidden w-16 cursor-pointer items-center justify-center opacity-0 transition-opacity duration-300 group-hover/slider:opacity-100 focus-visible:opacity-100 md:flex md:w-24";

const NavButton = ({ direction, title, onClick, t }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${NAV_BTN_CLASS} ${direction === "left" ? "left-0" : "right-0"}`}
    aria-label={t("Scroll {direction} through {title}", {
      direction: t(direction === "left" ? "Left" : "Right"),
      title,
    })}
  >
    <div className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all">
      {direction === "left" ? (
        <ChevronLeftIcon className="h-8 w-8" />
      ) : (
        <ChevronRightIcon className="h-8 w-8" />
      )}
    </div>
  </button>
);

// ─── MovieSlider: horizontal movie carousel ───────────────────────────────────

const MovieSlider = ({ title, movies = [], viewAllTo }) => {
  const { t } = useLanguage();
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const headingId = toHeadingId(title);

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, movies.length]);

  const handleScroll = useCallback(
    (direction) => {
      const el = sliderRef.current;
      if (!el) return;
      el.scrollBy({
        left: direction === "left" ? -el.clientWidth : el.clientWidth,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      window.setTimeout(checkScroll, 500);
    },
    [checkScroll],
  );

  return (
    <section
      aria-labelledby={headingId}
      className="group/slider mx-auto max-w-[1600px] relative overflow-hidden bg-transparent py-4 sm:py-10"
    >
      {/* ── Heading ── */}
      <div className="mb-4 flex items-center justify-between gap-4 px-4 sm:mb-8 sm:px-6 lg:px-24">
        <h2
          id={headingId}
          className="page-heading page-heading--violet flex items-center gap-2.5 sm:gap-3"
        >
          {title}
          <span className="mt-2 hidden h-0.5 w-12 rounded-full bg-purple-600 md:block" />
        </h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            aria-label={t("View all {title} movies", { title })}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            {t("View all")}{" "}
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* ── Nav buttons ── */}
      {canScrollLeft && (
        <NavButton
          direction="left"
          title={title}
          t={t}
          onClick={() => handleScroll("left")}
        />
      )}
      {canScrollRight && (
        <NavButton
          direction="right"
          title={title}
          t={t}
          onClick={() => handleScroll("right")}
        />
      )}

      {/* ── Scroll track ── */}
      <div
        ref={sliderRef}
        onScroll={checkScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-6 scroll-px-4 scroll-smooth sm:gap-5 sm:px-6 sm:pb-12 sm:scroll-px-6 lg:px-24 lg:scroll-px-24"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-[44vw] min-w-0 max-w-44 shrink-0 snap-start min-[380px]:w-40 min-[420px]:w-44 sm:w-56 sm:min-w-56 sm:max-w-60 lg:w-60 xl:w-64 xl:max-w-64"
          >
            <MovieCard movie={movie} headingLevel="h3" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(MovieSlider);
