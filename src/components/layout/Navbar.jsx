import useNavbarMenus from "./navbar/useNavbarMenus";
import { Link, useLocation } from "react-router-dom";
import {
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";

import NavbarAccount from "./navbar/NavbarAccount";
import { useLanguage } from "../../context/LanguageContext";
import { useNotification } from "../../context/NotificationContext";
import { THEMES } from "../../utils/theme";
import NavSearch from "./NavSearch";
import LanguageSelector from "./LanguageSelector";
import NotificationPanel from "./navbar/NotificationPanel";
import MobileMenu from "./navbar/MobileMenu";
import { NAV_LINKS, checkActiveLink } from "./navbar/navbarConfig";

// ─── Navbar: top bar with search, alerts & menus ──────────────────────────────

const Navbar = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  const { t } = useLanguage();

  const { unreadCount } = useNotification();

  const {
    showNotifPanel,
    setShowNotifPanel,
    isMenuOpen,
    setIsMenuOpen,
    panelRef,
    menuToggleRef,
    menuRef,
    closeMenu,
    closeNotifPanel,
  } = useNavbarMenus();

  const checkActive = (linkPath) => checkActiveLink(location, linkPath);

  const isLightTheme = theme === THEMES.LIGHT;

  const ThemeIcon = isLightTheme ? MoonIcon : SunIcon;

  const themeButtonLabel = isLightTheme
    ? "Switch to dark mode"
    : "Switch to light mode";

  // ─── Render: desktop bar & mobile drawer ─────────────────────────────────────

  return (
    <div className="site-navbar fixed inset-x-0 top-3 z-100 mx-auto w-full max-w-[1600px] px-2 min-[360px]:px-3 sm:top-8 sm:px-8 lg:px-12">
      <nav className="flex items-center justify-between rounded-full border border-[var(--color-border)] bg-[var(--color-nav-bg)] px-2 py-3 text-[var(--color-text)] shadow-2xl ring-1 ring-[var(--color-ring)] backdrop-blur-md transition-colors min-[360px]:px-4 sm:px-6 sm:py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src="/images/logo.svg"
            alt={t("CineMax Logo")}
            className="h-10 w-auto sm:h-12"
            decoding="async"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden shrink-0 items-center gap-6 text-sm xl:flex 2xl:gap-10 min-[1600px]:gap-12">
          {NAV_LINKS.map((link) => {
            const isActive = checkActive(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`group relative whitespace-nowrap py-1 font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "scale-105 text-[var(--nav-accent)]"
                    : "text-[var(--color-text-soft)] hover:scale-105 hover:text-[var(--color-text)]"
                }`}
              >
                {t(link.name)}

                <span
                  className={`absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full bg-[var(--nav-accent)] transition-all duration-300 ${
                    isActive
                      ? "w-4 opacity-100 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2 lg:gap-4 xl:gap-2 2xl:gap-3">
          <NavSearch
            key={location.key}
            onOpen={() => {
              setIsMenuOpen(false);
              setShowNotifPanel(false);
            }}
          />
          {/* Theme Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1 text-[var(--color-text)] transition-all hover:border-purple-500/50 hover:text-[var(--nav-accent)] active:scale-95 sm:min-h-11 sm:min-w-11 sm:p-2"
            aria-label={t(themeButtonLabel)}
            title={t(themeButtonLabel)}
          >
            <ThemeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              aria-label={t("Notifications")}
              aria-expanded={showNotifPanel}
              onClick={() => {
                setShowNotifPanel(!showNotifPanel);
                setIsMenuOpen(false);
              }}
              className={`relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-transparent bg-[var(--color-surface-2)] p-1 text-[var(--color-text)] transition-all active:scale-90 hover:text-[var(--nav-accent)] sm:min-h-11 sm:min-w-11 sm:p-2 ${
                showNotifPanel
                  ? "border-purple-500/40 bg-[var(--color-surface-3)] text-[var(--nav-accent)]"
                  : ""
              }`}
            >
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />

              {unreadCount > 0 && (
                <span
                  aria-label={t("{count} unread notifications", {
                    count: unreadCount,
                  })}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-lg"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationPanel
              isOpen={showNotifPanel}
              onClose={closeNotifPanel}
            />
          </div>

          {/* Profile Avatar */}
          <NavbarAccount />

          <LanguageSelector className="block" />
          {/* Mobile Menu */}
          <button
            ref={menuToggleRef}
            type="button"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setShowNotifPanel(false);
            }}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full p-1 text-[var(--color-text)] transition-colors hover:text-[var(--nav-accent)] sm:min-h-11 sm:min-w-11 sm:p-2 xl:hidden"
            aria-label={isMenuOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        menuRef={menuRef}
        toggleRef={menuToggleRef}
      />
    </div>
  );
};

export default Navbar;
