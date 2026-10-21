// ─── Constants: profile storage key ───────────────────────────────────────────

export const PROFILE_STORAGE_KEY = "movie_user_profiles";

// ─── Helpers: stored profiles & user normalization ────────────────────────────

export const getCurrentHostname = () => {
  if (typeof window === "undefined") {
    return "current host";
  }

  return window.location.hostname || "current host";
};

export const readStoredProfiles = () => {
  try {
    const savedProfiles = localStorage.getItem(PROFILE_STORAGE_KEY);
    return savedProfiles ? JSON.parse(savedProfiles) : {};
  } catch {
    return {};
  }
};

export const persistStoredProfiles = (profiles) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

export const normalizeUser = (firebaseUser) => {
  if (!firebaseUser) {
    return null;
  }

  const fallbackName = firebaseUser.email?.split("@")[0] || "Movie Fan";

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || fallbackName,
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || "",
    photoURL: firebaseUser.photoURL || "",
    memberSince: firebaseUser.metadata?.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toISOString()
      : new Date().toISOString(),
  };
};

export const mergeUserProfile = (authUser, savedProfile) => {
  if (!authUser) {
    return null;
  }

  return {
    ...authUser,
    name: savedProfile?.name?.trim() || authUser.name,
    bio: savedProfile?.bio || "",
    location: savedProfile?.location || "",
    favoriteGenre: savedProfile?.favoriteGenre || "",
    memberSince: savedProfile?.memberSince || authUser.memberSince,
    updatedAt: savedProfile?.updatedAt || null,
  };
};
