import { useCallback, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { getFirebaseErrorMessage } from "../../context/auth/authErrors";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default function useAuthActions(showNotification, syncSignedInUser) {
  const [authenticating, setAuthenticating] = useState(false);
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

  return { authenticating, login, register, signInWithGoogle };
}
