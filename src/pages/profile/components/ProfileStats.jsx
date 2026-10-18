import React from "react";
import {
  ChartBarIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useFavorites } from "../../../context/FavoritesContext";
import { useLanguage } from "../../../context/LanguageContext";

const ProfileStats = ({ user }) => {
  const { t } = useLanguage();
  const { favorites } = useFavorites();

  const averageRating = favorites.length
    ? (
        favorites.reduce(
          (total, movie) => total + Number(movie.rating || 0),
          0,
        ) / favorites.length
      ).toFixed(1)
    : "0.0";

  const favoriteGenres = favorites.flatMap((movie) => movie.genres || []);
  const topGenreEntry = Object.entries(
    favoriteGenres.reduce((counts, genre) => {
      counts[genre] = (counts[genre] || 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0];

  const profileCompletion = Math.round(
    ([user?.name, user?.location, user?.favoriteGenre, user?.bio].filter(
      Boolean,
    ).length /
      4) *
      100,
  );

  const stats = [
    {
      label: t("Saved Favorites"),
      value: favorites.length,
      detail: favorites.length
        ? t("Your personal collection is growing.")
        : t("Start building your list."),
      icon: <HeartIcon className="h-5 w-5 text-rose-400" />,
    },
    {
      label: t("Average Rating"),
      value: averageRating,
      detail: favorites.length
        ? t("Across the movies you saved.")
        : t("Add favorites to unlock insights."),
      icon: <StarIcon className="h-5 w-5 text-amber-400" />,
    },
    {
      label: t("Top Genre"),
      value: topGenreEntry?.[0] || "Open taste",
      detail: topGenreEntry
        ? t("{count} saved titles lean this way.", {
            count: topGenreEntry[1],
          })
        : t("No genre trend yet."),
      icon: <ChartBarIcon className="h-5 w-5 text-sky-400" />,
    },
    {
      label: t("Profile Complete"),
      value: `${profileCompletion}%`,
      detail: t("Add a location, genre, and bio to finish your identity."),
      icon: <SparklesIcon className="h-5 w-5 text-violet-400" />,
    },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm sm:p-7">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">
          {t("Account Snapshot")}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {t("Your movie DNA")}
        </h3>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.25rem] border border-white/10 bg-slate-950/35 p-4 transition-colors hover:border-white/20"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/5 p-3">{stat.icon}</div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-400">{stat.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStats;
