import { EXPLORE_LINKS, GENRE_LINKS, SOCIAL_LINKS } from "./footer/footerLinks";
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

// ─── Data: nav, genre & social links ──────────────────────────────────────────

// ─── Footer: brand, links & genres ────────────────────────────────

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-4 text-center md:text-left">
            <img
              src="/images/logo.svg"
              alt={t("CineMax Logo")}
              className="mx-auto h-10 w-auto sm:h-12 md:mx-0"
              loading="lazy"
              decoding="async"
            />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
              {t("Discover. Track. Watch.")}
            </p>
            <p className="text-sm leading-relaxed text-gray-400">
              {t(
                "Your ultimate destination for the latest blockbusters and timeless classics. Explore, discover, and enjoy the world of cinema.",
              )}
            </p>

            <div className="flex justify-center gap-3 md:justify-start">
              {SOCIAL_LINKS.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-purple-500/50 hover:text-white"
                >
                  {icon}
                </a>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-gray-500">
              {t(
                "This product uses the TMDB API but is not endorsed or certified by TMDB.",
              )}{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 underline underline-offset-2 hover:text-purple-400"
              >
                TMDB
              </a>
            </p>
          </div>

          <nav
            aria-label={t("Explore")}
            className="text-center text-sm md:text-left"
          >
            <h3 className="mb-3 font-semibold text-white">{t("Explore")}</h3>
            <ul className="space-y-2 text-gray-400">
              {EXPLORE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="transition hover:text-purple-400">
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-genres-heading"
            className="text-center md:text-left"
          >
            <h3
              id="footer-genres-heading"
              className="mb-3 font-semibold text-white"
            >
              {t("Browse by genre")}
            </h3>
            <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
              {GENRE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-purple-500/50 hover:text-purple-300"
                  >
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Link
                to="/movies"
                className="text-xs font-semibold text-purple-400 transition hover:text-purple-300"
              >
                {t("Browse all movies")} →
              </Link>
            </div>
          </nav>

          <nav
            aria-labelledby="footer-legal-heading"
            className="text-center text-sm md:text-left"
          >
            <h3
              id="footer-legal-heading"
              className="mb-3 font-semibold text-white"
            >
              {t("Legal & Resources")}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to="/privacy"
                  className="transition hover:text-purple-400"
                >
                  {t("Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-purple-400">
                  {t("Terms of Use")}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-purple-400"
                >
                  {t("Movie data by TMDB")}
                </a>
              </li>
              <li>
                <a
                  href="https://developer.themoviedb.org/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-purple-400"
                >
                  {t("TMDB API documentation")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 md:flex-row">
          <p className="text-center text-xs text-gray-500 md:text-left">
            &copy; {currentYear} CineMax. {t("All rights reserved.")}
          </p>

          <p className="flex items-center gap-1.5 text-center text-xs text-gray-500 md:text-right">
            <FaHeart size={10} className="text-red-500" aria-hidden="true" />
            {t("Built with React, Vite & Firebase")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
