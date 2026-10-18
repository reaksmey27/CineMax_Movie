import { Link } from "react-router-dom";
import {
  ArrowLeftOnRectangleIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { useLanguage } from "../../../context/LanguageContext";

const getHandle = (email) =>
  email?.split("@")[0]?.replace(/\s+/g, "").toLowerCase() || "moviefan";

const getJoined = (date, language) =>
  date
    ? new Date(date).toLocaleDateString(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

const ProfileAvatar = ({ user, onLogout }) => {
  const { language, t } = useLanguage();
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
          <CheckBadgeIcon className="h-4 w-4" />
          {t("Synced")}
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
          CinePass
        </div>
      </div>

      <div className="relative mx-auto mb-6 mt-7 h-28 w-28 sm:h-32 sm:w-32">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || t("Profile avatar")}
            className="h-full w-full rounded-[2rem] border border-white/10 object-cover shadow-xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-slate-800 text-4xl font-semibold text-white shadow-xl">
            {initial}
          </div>
        )}
        <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-100 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          {t("Verified")}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-300">
          {t("Member")}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {user.name}
        </h2>
        <p className="text-sm text-gray-400">@{getHandle(user.email)}</p>
        <p className="mt-2 text-sm text-gray-300">{user.email}</p>
      </div>

      <div className="mt-6 space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              {t("Genre")}
            </p>
            <p className="mt-2 text-sm text-white">
              {user.favoriteGenre || t("Open taste")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              {t("Status")}
            </p>
            <p className="mt-2 text-sm text-emerald-300">{t("Active")}</p>
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MapPinIcon className="h-4 w-4 shrink-0 text-fuchsia-400" />
            <span>{user.location || t("Add your city")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <CalendarDaysIcon className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>
              {t("Joined {date}", {
                date: getJoined(user.memberSince, language) || t("Recently"),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          to="/movies"
          className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-white py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.98]"
        >
          <PlayIcon className="h-4 w-4" />
          {t("Browse Movies")}
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-300 transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4" />
          {t("Sign Out")}
        </button>
      </div>
    </div>
  );
};

export default ProfileAvatar;
