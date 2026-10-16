import { Navigate } from "react-router-dom";

import useProfile from "../../hooks/auth/useProfile";

import ProBanner from "./components/ProBanner";
import ProfileAvatar from "./components/ProfileAvatar";
import ProfileCollection from "./components/ProfileCollection";
import ProfileForm from "./components/ProfileForm";
import ProfileStats from "./components/ProfileStats";

const ProfilePage = () => {
  const {
    user,
    logout,
    isEditing,
    setIsEditing,
    formData,
    isDirty,
    handleFieldChange,
    handleCancelEditing,
    handleUpdateProfile,
  } = useProfile();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pb-20 pt-24 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16 xl:px-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0))]" />
      <div className="absolute right-0 top-24 -z-10 h-96 w-96 rounded-full bg-sky-500/8 blur-[120px]" />

      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <ProBanner user={user} />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-4">
            <ProfileAvatar user={user} onLogout={logout} />
            <ProfileStats user={user} />
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-8">
            <ProfileForm
              isEditing={isEditing}
              formData={formData}
              isDirty={isDirty}
              onFieldChange={handleFieldChange}
              onStartEditing={() => setIsEditing(true)}
              onCancelEditing={handleCancelEditing}
              onSubmit={handleUpdateProfile}
            />
            <ProfileCollection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
