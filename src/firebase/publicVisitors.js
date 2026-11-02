import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firestore";

const reference = (uid) => doc(db, "publicVisitors", uid);
export const subscribeVisitors = (next, error) =>
  onSnapshot(
    query(
      collection(db, "publicVisitors"),
      orderBy("lastVisitedAt", "desc"),
      limit(6),
    ),
    (snapshot) =>
      next(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    error,
  );
const visits = new Map();
export function publishPublicVisitor(user) {
  if (!user?.uid) return Promise.resolve();
  const candidate = user.avatar || user.photoURL || "";
  const photoURL =
    typeof candidate === "string" &&
    /^https:\/\//.test(candidate) &&
    candidate.length <= 2048
      ? candidate
      : "";
  const memoryKey = JSON.stringify([user.uid, photoURL]);
  if (visits.has(memoryKey)) return visits.get(memoryKey);
  const key = `cinemax:public-visitor:v2:${user.uid}`;
  try {
    if (sessionStorage.getItem(key) === photoURL) return Promise.resolve();
  } catch {
    /* Memory fallback. */
  }
  const pending = setDoc(reference(user.uid), {
    photoURL,
    lastVisitedAt: serverTimestamp(),
  })
    .then(() => {
      try {
        sessionStorage.setItem(key, photoURL);
      } catch {
        /* Memory fallback. */
      }
    })
    .catch((error) => {
      visits.delete(memoryKey);
      throw error;
    });
  visits.set(memoryKey, pending);
  return pending;
}
