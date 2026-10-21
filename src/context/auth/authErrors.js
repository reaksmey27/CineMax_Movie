import { getCurrentHostname } from "./authHelpers";

// ─── getFirebaseErrorMessage: friendly auth errors ────────────────────────────

export const getFirebaseErrorMessage = (error) => {
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
