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
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useNotification } from "./NotificationContext";

// ─── Constants: context key, profile storage & Google provider ────────────────

const AuthContext = createContext();
const PROFILE_STORAGE_KEY = "movie_user_profiles";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Helpers: stored profiles & user normalization ────────────────────────────

const getCurrentHostname = () => {
  if (typeof window === "undefined") {
    return "current host";
  }

  return window.location.hostname || "current host";
};

const readStoredProfiles = () => {
  try {
    const savedProfiles = localStorage.getItem(PROFILE_STORAGE_KEY);
    return savedProfiles ? JSON.parse(savedProfiles) : {};
  } catch {
    return {};
  }
};

const persistStoredProfiles = (profiles) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

const normalizeUser = (firebaseUser) => {
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

const mergeUserProfile = (authUser, savedProfile) => {
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

// ─── getFirebaseErrorMessage: friendly auth errors ────────────────────────────

const getFirebaseErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/invalid-credential":
      return "That email or password doesn't look right.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/missing-password":
      return "Please enter your password before continuing.";
    case "auth/email-already-in-use":
      return "That email is already registered. Try signing in instead.";
    case "auth/weak-password":
      return "Use a stronger password with at least 6 characters.";
    case "auth/user-not-found":
      return "We couldn't find an account with that email yet.";
    case "auth/wrong-password":
      return "That password is incorrect. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts were made. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/cancelled-popup-request":
      return "A sign-in popup is already open.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google popup. Please allow popups and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in your Firebase Authentication settings yet.";
    case "auth/configuration-not-found":
      return "Firebase Authentication can't find a Google sign-in configuration for this project.";
    case "auth/unauthorized-domain":
      return `This domain (${getCurrentHostname()}) is not authorized in Firebase Authentication. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    case "auth/app-not-authorized":
      return `This Firebase app or API key is not authorized for Authentication on ${getCurrentHostname()}.`;
    case "auth/invalid-api-key":
      return "Your Firebase API key is invalid for this project.";
    case "auth/network-request-failed":
      return "A network error interrupted Google sign-in. Please try again.";
    case "auth/web-storage-unsupported":
      return "This browser blocks the storage Firebase Auth needs for popup sign-in.";
    case "auth/operation-not-supported-in-this-environment":
      return "Google popup sign-in requires the app to run on http:// or https://.";
    default:
      return error?.message || "We couldn't sign you in with Google right now.";
  }
};

// ─── AuthProvider: session, login & profile actions ───────────────────────────

export const AuthProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [profileOverrides, setProfileOverrides] = useState(() =>
    readStoredProfiles(),
  );
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  // ─── Effects: auth listener & profile sync ────────────────────────────────────

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

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      return;
    }

    setUser(mergeUserProfile(authUser, profileOverrides[authUser.uid]));
  }, [authUser, profileOverrides]);

  // ─── Actions: login, register, Google sign-in, logout ─────────────────────────

  const syncSignedInUser = useCallback(
    (firebaseUser) => {
      const nextAuthUser = normalizeUser(firebaseUser);

      if (!nextAuthUser) {
        setAuthUser(null);
        setUser(null);
        return null;
      }

      const nextUser = mergeUserProfile(
        nextAuthUser,
        profileOverrides[nextAuthUser.uid],
      );

      setAuthUser(nextAuthUser);
      setUser(nextUser);

      return nextUser;
    },
    [profileOverrides],
  );

  const login = useCallback(
    async ({ email, password }) => {
      setAuthenticating(true);

      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const nextUser = syncSignedInUser(result.user);

        if (nextUser) {
          showNotification(`Welcome back, ${nextUser.name}!`, "success");
        }

        return nextUser;
      } catch (error) {
        showNotification(getFirebaseErrorMessage(error), "error");
        return null;
      } finally {
        setAuthenticating(false);
      }
    },
    [showNotification, syncSignedInUser],
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setAuthenticating(true);

      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const trimmedName = name.trim();

        if (trimmedName) {
          await updateFirebaseProfile(result.user, {
            displayName: trimmedName,
          });
        }

        const nextUser = syncSignedInUser(result.user);

        if (nextUser) {
          showNotification(`Account created for ${nextUser.name}!`, "success");
        }

        return nextUser;
      } catch (error) {
        showNotification(getFirebaseErrorMessage(error), "error");
        return null;
      } finally {
        setAuthenticating(false);
      }
    },
    [showNotification, syncSignedInUser],
  );

  const signInWithGoogle = useCallback(async () => {
    setAuthenticating(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const nextUser = syncSignedInUser(result.user);

      if (nextUser) {
        showNotification(`Welcome back, ${nextUser.name}!`, "success");
      }

      return nextUser;
    } catch (error) {
      console.error("[firebase-auth] Google sign-in failed", {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
      });
      const details = error?.code ? ` (${error.code})` : "";
      showNotification(`${getFirebaseErrorMessage(error)}${details}`, "error");
      return null;
    } finally {
      setAuthenticating(false);
    }
  }, [showNotification, syncSignedInUser]);

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
      setUser(null);
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

  // ─── Context Value: memoized auth API ─────────────────────────────────────────

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
