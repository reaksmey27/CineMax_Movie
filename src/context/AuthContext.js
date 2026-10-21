import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useNotification } from "./NotificationContext";
import {
  mergeUserProfile,
  normalizeUser,
  persistStoredProfiles,
  readStoredProfiles,
} from "./auth/authHelpers";
import useAuthActions from "../hooks/auth/useAuthActions";

// ─── Constants: context key & Google provider ─────────────────────────────────

const AuthContext = createContext();

// ─── AuthProvider: session, login & profile actions ───────────────────────────

export const AuthProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const [authUser, setAuthUser] = useState(null);
  const [profileOverrides, setProfileOverrides] = useState(() =>
    readStoredProfiles(),
  );
  const [loading, setLoading] = useState(true);

  // ─── Effects: auth listener & profile sync ───────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthUser(normalizeUser(firebaseUser));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    persistStoredProfiles(profileOverrides);
  }, [profileOverrides]);

  const user = useMemo(
    () =>
      authUser
        ? mergeUserProfile(authUser, profileOverrides[authUser.uid])
        : null,
    [authUser, profileOverrides],
  );

  // ─── Actions: login, register, Google sign-in, logout ────────────────────────

  const syncSignedInUser = useCallback(
    (firebaseUser) => {
      const nextAuthUser = normalizeUser(firebaseUser);

      if (!nextAuthUser) {
        setAuthUser(null);

        return null;
      }

      const nextUser = mergeUserProfile(
        nextAuthUser,
        profileOverrides[nextAuthUser.uid],
      );

      setAuthUser(nextAuthUser);

      return nextUser;
    },
    [profileOverrides],
  );

  const { authenticating, login, register, signInWithGoogle } = useAuthActions(
    showNotification,
    syncSignedInUser,
  );

  const updateProfile = useCallback(
    (updates) => {
      if (!authUser?.uid) {
        return null;
      }

      const nextSavedProfile = {
        ...profileOverrides[authUser.uid],
        ...updates,
        memberSince:
          profileOverrides[authUser.uid]?.memberSince || authUser.memberSince,
        updatedAt: new Date().toISOString(),
      };

      setProfileOverrides((prev) => ({
        ...prev,
        [authUser.uid]: nextSavedProfile,
      }));

      if (updates.name?.trim() && auth.currentUser) {
        updateFirebaseProfile(auth.currentUser, {
          displayName: updates.name.trim(),
        }).catch(() => {});
      }

      return mergeUserProfile(authUser, nextSavedProfile);
    },
    [authUser, profileOverrides],
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setAuthUser(null);

      showNotification("You've been signed out safely.", "info");
      return true;
    } catch (error) {
      console.error("[auth] logout failed", {
        code: error?.code,
        message: error?.message,
        fullError: error,
      });
      showNotification("We couldn't sign you out right now.", "error");
      return false;
    }
  }, [showNotification]);

  // ─── Context Value: memoized auth API ────────────────────────────────────────

  const value = useMemo(
    () => ({
      user,
      loading: loading || Boolean(authUser && !user),
      authenticating,
      login,
      register,
      signInWithGoogle,
      logout,
      updateProfile,
      isAuthenticated: Boolean(user),
    }),
    [
      authenticating,
      authUser,
      loading,
      login,
      logout,
      register,
      signInWithGoogle,
      updateProfile,
      user,
    ],
  );

  return createElement(AuthContext.Provider, { value }, children);
};

// ─── useAuth: read auth context safely ────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
