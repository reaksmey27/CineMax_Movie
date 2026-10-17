import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const REQUIRED_ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingFirebaseEnvKeys = REQUIRED_ENV_KEYS.filter(
  (envKey) => !import.meta.env[envKey],
);

if (missingFirebaseEnvKeys.length > 0) {
  // Fail loudly instead of silently falling back to a hardcoded project.
  // A hardcoded fallback config here would mean anyone who builds this
  // repo without their own .env silently connects to someone else's live
  // Firebase project (auth + Firestore), which is a real security risk.
  throw new Error(
    `[firebase] Missing required env vars: ${missingFirebaseEnvKeys.join(
      ", ",
    )}. Create a .env file (see .env.example) with your own Firebase project's ` +
      `credentials. Get them from Firebase Console -> Project Settings -> General -> Your apps.`,
  );
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;

if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export default app;
