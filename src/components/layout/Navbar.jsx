import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { FaCoffee } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { THEMES } from "../../utils/theme";
import DonationModal from "../ui/DonationModal.jsx";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Movies", path: "/movies" },
  { name: "Trending", path: "/trending" },
  { name: "Favorites", path: "/favorites" },
  { name: "Watchlist", path: "/watchlist" },
  { name: "Upcoming", path: "/upcoming" },
];

const Navbar = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, isAuthenticated } = useAuth();

  const { history, unreadCount, markAllAsRead, clearHistory, getIcon } =
    useNotification();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const panelRef = useRef(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeDesktopMenu = () => {
      if (desktop.matches) setIsMenuOpen(false);
    };
    desktop.addEventListener("change", closeDesktopMenu);
    return () => desktop.removeEventListener("change", closeDesktopMenu);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowNotifPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkActive = (linkPath) => {
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

  const formatTime = (isoString) => {
    const date = new Date(isoString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitial = () => {
    const value = user?.name || user?.email || "";

    return value.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isLightTheme = theme === THEMES.LIGHT;

  const ThemeIcon = isLightTheme ? MoonIcon : SunIcon;

  const themeButtonLabel = isLightTheme
    ? "Switch to dark mode"
    : "Switch to light mode";

  const modalState = { backgroundLocation: location };

  return (
    <div className="fixed inset-x-0 top-0 z-100 mx-auto w-full max-w-[1600px] px-2 sm:top-6 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-nav-bg)] px-3 py-2.5 text-[var(--color-text)] shadow-2xl ring-1 ring-[var(--color-ring)] backdrop-blur-md transition-all sm:rounded-full sm:border sm:px-6 sm:py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src="/images/logo.png"
            alt="CineMax Logo"
            className="h-8 w-auto sm:h-10"
            decoding="async"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 xl:flex 2xl:gap-10">
          {NAV_LINKS.map((link) => {
            const isActive = checkActive(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`group relative py-1 font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "scale-105 text-purple-500"
                    : "text-[var(--color-text-soft)] hover:scale-105 hover:text-[var(--color-text)]"
                }`}
              >
                {link.name}

                <span
                  className={`absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full bg-purple-500 transition-all duration-300 ${
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
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {/* Theme Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1.5 text-[var(--color-text)] transition-all hover:border-purple-500/50 hover:text-purple-400 active:scale-95 sm:p-2"
            aria-label={themeButtonLabel}
            title={themeButtonLabel}
          >
            <ThemeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={showNotifPanel}
              onClick={() => {
                setShowNotifPanel(!showNotifPanel);
                setIsMenuOpen(false);

                if (!showNotifPanel) {
                  markAllAsRead();
                }
              }}
              className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-transparent bg-[var(--color-surface-2)] p-1.5 text-[var(--color-text)] transition-all active:scale-90 hover:text-purple-400 sm:p-2 ${
                showNotifPanel
                  ? "border-purple-500/40 bg-[var(--color-surface-3)] text-purple-400"
                  : ""
              }`}
            >
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="fixed left-2 right-2 top-16 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-2xl backdrop-blur-2xl duration-300 animate-in fade-in slide-in-from-top-4 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-4 sm:w-80 sm:rounded-4xl">
                <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-6 py-5">
                  <h3 className="text-sm font-black uppercase tracking-tighter italic">
                    Notifications
                  </h3>

                  <button
                    type="button"
                    onClick={clearHistory}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-[var(--color-surface-1)] hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="no-scrollbar max-h-[min(25rem,calc(100dvh-12rem))] overflow-y-auto overscroll-contain">
                  {history.length === 0 ? (
                    <div className="p-10 text-center">
                      <BellIcon className="mx-auto mb-3 h-8 w-8 text-gray-700 opacity-50" />

                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        No new alerts.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {history.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex gap-4 border-b border-[var(--color-border-soft)] px-6 py-4 transition-colors hover:bg-[var(--color-surface-1)]"
                        >
                          <div className="mt-1 shrink-0">
                            {getIcon(notif.type, true)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[10px] font-bold leading-relaxed text-[var(--color-text)] sm:text-xs">
                              {notif.message}
                            </p>

                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                              {formatTime(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="hidden items-center gap-4 sm:flex">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className={`relative rounded-full border p-2 transition-all duration-300 active:scale-90 ${
                  location.pathname === "/profile"
                    ? "border-purple-500/40 bg-[var(--color-surface-3)] text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                    : "border-transparent bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-purple-500/30 hover:text-purple-400"
                }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-[10px] font-black uppercase text-white">
                    {getUserInitial()}
                  </div>
                )}

                {/* Active Dot */}
                <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-[#0B1020] bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
              </Link>
            ) : (
              <Link
                to="/login"
                state={modalState}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-purple-500/50 px-5 py-1.5 text-sm font-bold transition-all hover:bg-purple-600"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Buy Me a Coffee Button */}
          <button
            type="button"
            onClick={() => setIsDonationOpen(true)}
            className="hidden items-center gap-2 rounded-full border border-amber-400/40 bg-[var(--color-surface-2)] px-4 py-1.5 text-sm font-bold text-amber-200 transition-all hover:border-amber-400/70 hover:bg-[var(--color-surface-3)] hover:text-amber-100 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] active:scale-95 sm:flex"
          >
            <FaCoffee className="h-4 w-4" aria-hidden="true" />
            <span>Buy me a coffee</span>
          </button>

          {/* Mobile: coffee icon only */}
          <button
            type="button"
            onClick={() => setIsDonationOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-amber-400/40 bg-[var(--color-surface-2)] p-1.5 text-[var(--color-text)] transition-all hover:border-amber-400/70 hover:text-amber-200 active:scale-95 sm:hidden hover:shadow-[0_0_18px_rgba(245,158,11,0.35)]"
            aria-label="Buy me a coffee"
            title="Buy me a coffee"
          >
            <FaCoffee className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setShowNotifPanel(false);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-[var(--color-text)] transition-colors hover:text-purple-500 sm:p-2 xl:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="xl:hidden">
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-[100] bg-black/60 backdrop-blur-sm sm:top-24"
            aria-label="Close menu overlay"
            onClick={() => setIsMenuOpen(false)}
          />

          <aside className="fixed bottom-0 right-0 top-16 z-[110] w-[min(18rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain border-l border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 shadow-2xl ring-1 ring-[var(--color-ring)] backdrop-blur-2xl sm:top-24">
            <div className="mb-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-1)] p-3">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-black uppercase text-white">
                      {getUserInitial()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {user?.name || "Profile"}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {user?.email}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={modalState}
                  className="flex items-center justify-between rounded-xl bg-purple-600 px-4 py-3 text-sm font-black text-white transition hover:bg-purple-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = checkActive(link.path);

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      isActive
                        ? "bg-purple-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                        : "text-[var(--color-text-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="mt-5 flex w-full items-center justify-between rounded-xl border border-red-500/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                Logout
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            )}
          </aside>
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </div>
  );
};

export default Navbar;
