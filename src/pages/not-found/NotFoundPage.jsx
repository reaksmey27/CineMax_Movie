import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  FilmIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

export default function NotFoundPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const goBack = () => {
    if (
      Number.isInteger(window.history.state?.idx) &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate("/movies", { replace: true });
    }
  };

  return (
    <section
      aria-labelledby="not-found-heading"
      className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-500/15 blur-3xl"
      />
      <div className="relative w-full max-w-xl rounded-3xl border border-(--color-border) bg-(--color-surface-1) px-5 py-10 text-center shadow-xl sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10 text-purple-500"
        >
          <FilmIcon className="h-8 w-8" />
        </div>
        <p className="mb-3 text-7xl font-black tracking-tight text-purple-500 sm:text-8xl">
          404
        </p>
        <h1
          id="not-found-heading"
          className="page-heading page-heading--violet"
        >
          {t("Page not found")}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-(--color-text-subtle) sm:text-base">
          {t("This page is unavailable. Find your next movie in the catalog.")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/movies"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
          >
            <MagnifyingGlassIcon
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            {t("Browse Movies")}
          </Link>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-(--color-border) px-5 py-3 text-sm font-semibold text-(--color-text) transition-colors hover:bg-(--color-surface-2) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
          >
            <ArrowLeftIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {t("Go Back")}
          </button>
        </div>
      </div>
    </section>
  );
}
