import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import app from "./config";

let database;

try {
  database = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  console.warn(
    "[firestore] Persistent offline cache is unavailable; using in-memory cache.",
    error,
  );
  database = getFirestore(app);
}

export const db = database;
