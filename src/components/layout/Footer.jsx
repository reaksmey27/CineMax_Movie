import React, { memo } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-10 grid grid-cols-1 gap-8 sm:mb-12 sm:gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-4 text-center md:text-left">
            <img
              src="/images/logo.png"
              alt={t("CineMax Logo")}
              className="mx-auto h-8 w-auto sm:h-10 md:mx-0"
              loading="lazy"
              decoding="async"
            />
            <p className="text-sm leading-relaxed text-gray-400">
              {t(
                "Your ultimate destination for the latest blockbusters and timeless classics. Explore, discover, and enjoy the world of cinema.",
              )}
            </p>
          </div>

          <div className="flex flex-col space-y-2 text-center text-sm text-gray-400 md:text-left">
            <h3 className="mb-2 font-semibold text-white">{t("Explore")}</h3>
            <Link to="/" className="hover:text-purple-400">
              {t("Home")}
            </Link>
            <Link to="/movies" className="hover:text-purple-400">
              {t("Movies")}
            </Link>
            <Link to="/trending" className="hover:text-purple-400">
              {t("Trending")}
            </Link>
            <Link to="/favorites" className="hover:text-purple-400">
              {t("Favorites")}
            </Link>
            <Link to="/upcoming" className="hover:text-purple-400">
              {t("Upcoming")}
            </Link>
          </div>

          <div className="flex flex-col space-y-2 text-center text-sm text-gray-400 md:text-left">
            <h3 className="mb-2 font-semibold text-white">{t("Legal")}</h3>
            <Link to="/privacy" className="hover:text-purple-400">
              {t("Privacy Policy")}
            </Link>
            <Link to="/terms" className="hover:text-purple-400">
              {t("Terms of Use")}
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-center font-semibold text-white md:text-left">
              {t("Stay Updated")}
            </h3>
            <form
              className="flex flex-col gap-2 min-[420px]:flex-row xl:flex-col"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="email" className="sr-only">
                {t("Email")}
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder={t("Email address")}
                className="min-w-0 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="min-h-11 shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-700"
              >
                {t("Join")}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 md:flex-row">
          <p className="text-center text-xs text-gray-500 md:text-left">
            &copy; {currentYear} CineMax. {t("All rights reserved.")}
          </p>

          <div className="flex space-x-5 text-gray-500">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              <FaLinkedin size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              <FaTwitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
