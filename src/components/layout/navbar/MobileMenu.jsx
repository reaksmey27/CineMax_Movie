import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { NAV_LINKS, checkActiveLink, getUserInitial } from "./navbarConfig";

// ─── MobileMenu: slide-in drawer with focus trap ──────────────────────────────

const MobileMenu = ({ isOpen, onClose, menuRef, toggleRef }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const wasMenuOpen = useRef(false);

  // ─── Effects: scroll lock & focus trap ───────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (wasMenuOpen.current && toggleRef.current?.getClientRects().length) {
        toggleRef.current.focus();
      }
      wasMenuOpen.current = false;
      return undefined;
    }

    wasMenuOpen.current = true;
    const focusableElements = () =>
      menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [];
    focusableElements()[0]?.focus();

    const handleMenuKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = focusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleMenuKeyDown);
    return () => document.removeEventListener("keydown", handleMenuKeyDown);
  }, [isOpen, onClose, menuRef, toggleRef]);

  // ─── Handlers: logout ────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const modalState = { backgroundLocation: location };

  if (!isOpen) return null;

  // ─── Render: backdrop & drawer ───────────────────────────────────────────────

  return (
    <div className="xl:hidden">
      <button
        type="button"
        className="fixed inset-x-0 bottom-0 top-20 z-[100] bg-black/60 backdrop-blur-sm sm:top-28"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
      />

      <aside
        ref={menuRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label={t("Main navigation")}
        className="no-scrollbar fixed bottom-0 right-0 top-20 z-[110] w-[min(18rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain border-l border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 shadow-2xl ring-1 ring-[var(--color-ring)] backdrop-blur-2xl sm:top-28"
      >
        <div className="mb-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-1)] p-3">
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-3"
              onClick={onClose}
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
                  {getUserInitial(user)}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-black">
                  {user?.name || t("Profile")}
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
              onClick={onClose}
            >
              {t("Sign In")}
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </Link>
          )}
        </div>

        <nav aria-label={t("Mobile navigation")}>
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = checkActiveLink(location, link.path);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onClose}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    isActive
                      ? "bg-purple-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.25)]"
                      : "text-[var(--color-text-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {t(link.name)}
                </Link>
              );
            })}
          </div>
        </nav>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className="mt-5 flex w-full items-center justify-between rounded-xl border border-red-500/30 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            {t("Logout")}
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        )}
      </aside>
    </div>
  );
};

export default MobileMenu;
