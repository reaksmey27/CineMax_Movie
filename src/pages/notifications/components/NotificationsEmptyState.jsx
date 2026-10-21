import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

// ─── NotificationsEmptyState: placeholder for empty filtered history ──────────

const NotificationsEmptyState = ({ filter }) => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center sm:min-h-96">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface-1)">
        <BellIcon
          className="h-8 w-8 text-(--color-text-subtle)"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-xl font-black">
        {filter === "unread"
          ? t("You’re all caught up")
          : t("No notifications yet")}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-(--color-text-subtle)">
        {filter === "unread"
          ? t("There are no unread updates. New activity will show up here.")
          : t(
              "Updates about your saved movies and account activity will appear here.",
            )}
      </p>
      {filter === "all" && (
        <Link
          to="/movies"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-purple-600 px-5 text-sm font-bold text-white transition-colors hover:bg-purple-500"
        >
          {t("Explore movies")}
        </Link>
      )}
    </div>
  );
};

export default NotificationsEmptyState;
