import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
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
export const subscribeVisitorPreference = (uid, next, error) =>
  onSnapshot(reference(uid), (snapshot) => next(snapshot.exists()), error);
export const setVisitorPreference = (user, enabled) => {
  if (!enabled) return deleteDoc(reference(user.uid));
  const candidate = user.avatar || user.photoURL || "";
  const photoURL =
    /^https:\/\//i.test(candidate) && candidate.length <= 2048 ? candidate : "";
  return setDoc(reference(user.uid), {
    photoURL,
    lastVisitedAt: serverTimestamp(),
  });
};

const visits = new Map();
export function touchPublicVisitor(uid) {
  if (visits.has(uid)) return visits.get(uid);
  const key = `cinemax:public-visitor:${uid}`;
  try {
    if (sessionStorage.getItem(key)) return Promise.resolve();
  } catch {
    /* Memory fallback. */
  }
  const pending = runTransaction(db, async (transaction) => {
    const target = reference(uid);
    const snapshot = await transaction.get(target);
    // Never create a public profile without an explicit opt-in.
    if (snapshot.exists())
      transaction.update(target, { lastVisitedAt: serverTimestamp() });
  })
    .then(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* Memory fallback. */
      }
    })
    .catch((error) => {
      visits.delete(uid);
      throw error;
    });
  visits.set(uid, pending);
  return pending;
}
