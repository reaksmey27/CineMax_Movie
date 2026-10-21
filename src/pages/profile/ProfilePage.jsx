import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import useProfile from "../../hooks/auth/useProfile";
import ProfileSkeleton from "./components/ProfileSkeleton";
import ProfileCollection from "./components/ProfileCollection";
import ProfileForm from "./components/ProfileForm";
import { useLanguage } from "../../context/LanguageContext";

// ─── ProfilePage: account, stats & collections ────────────────────────────────

const ProfilePage = () => {
  const { t } = useLanguage();
  const profile = useProfile();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState(null);
  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      if (await profile.logout()) navigate("/", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };
  const { user, loading, isEditing, setIsEditing } = profile;
  if (loading)
    return (
      <>
        <span className="sr-only">{t("Loading your profile...")}</span>
        <ProfileSkeleton />
      </>
    );
  if (!user)
    return <Navigate to="/login" state={{ returnTo: "/profile" }} replace />;

  const avatar = user.avatar || user.photoURL;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 sm:px-8 sm:pt-40 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 lg:flex-row lg:items-center lg:justify-between sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            {avatar && failedAvatar !== avatar ? (
              <img
                src={avatar}
                alt={t("{name}'s profile photo", { name: user.name })}
                referrerPolicy="no-referrer"
                onError={() => setFailedAvatar(avatar)}
                className="h-16 w-16 shrink-0 rounded-full border border-[var(--color-border)] object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <div
                aria-label={t("Profile avatar")}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white sm:h-20 sm:w-20"
              >
                {(user.name || user.email || "U")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {user.name}
              </h1>
              <p className="mt-2 break-all text-sm text-[var(--color-text-muted)] sm:text-base">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              {t("Edit Profile")}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500 disabled:cursor-wait disabled:opacity-60"
            >
              <ArrowRightOnRectangleIcon
                className="h-4 w-4"
                aria-hidden="true"
              />
              {signingOut ? t("Logging out...") : t("Log out")}
            </button>
          </div>
        </header>
        <ProfileCollection />
        {isEditing && (
          <ProfileForm
            formData={profile.formData}
            isDirty={profile.isDirty}
            onFieldChange={profile.handleFieldChange}
            onCancelEditing={profile.handleCancelEditing}
            onSubmit={profile.handleUpdateProfile}
          />
        )}
      </div>
    </div>
  );
};
export default ProfilePage;
