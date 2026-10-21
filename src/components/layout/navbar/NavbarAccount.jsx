import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { getUserInitial } from "./navbarConfig";

export default function NavbarAccount() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const modalState = { backgroundLocation: location };
  return (
    <div className="hidden items-center gap-4 sm:flex">
      {isAuthenticated ? (
        <Link
          to="/profile"
          className={`relative rounded-full border p-2 transition-all duration-300 active:scale-90 ${
            location.pathname === "/profile"
              ? "border-purple-500/40 bg-[var(--color-surface-3)] text-[var(--nav-accent)] shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              : "border-transparent bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-purple-500/30 hover:text-[var(--nav-accent)]"
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
              {getUserInitial(user)}
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
          {t("Sign In")}
        </Link>
      )}
    </div>
  );
}
