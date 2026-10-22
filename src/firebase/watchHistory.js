import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const WATCH_HISTORY_COLLECTION = "watchHistory";
const historyCollection = (database, userId) => {
  if (!userId) throw new Error("A signed-in user is required.");
  return collection(database, WATCH_HISTORY_COLLECTION, userId, "movies");
};
const historyDocument = (database, userId, movieId) => {
  if (!Number.isSafeInteger(movieId) || movieId <= 0)
    throw new Error("Invalid movie ID.");
  return doc(historyCollection(database, userId), String(movieId));
};

export function subscribeWatchHistory(database, userId, onHistory, onError) {
  return onSnapshot(
    query(
      historyCollection(database, userId),
      orderBy("lastWatchedAt", "desc"),
      limit(50),
    ),
    (snapshot) => onHistory(snapshot.docs.map((item) => item.data())),
    onError,
  );
}

export async function saveWatchHistory(database, userId, movie, details) {
  const {
    server,
    positionSeconds = 0,
    durationSeconds = 0,
    completed = false,
  } = details;
  if (
    !server ||
    !Number.isFinite(positionSeconds) ||
    !Number.isFinite(durationSeconds) ||
    positionSeconds < 0 ||
    durationSeconds < 0 ||
    positionSeconds > 86400 ||
    durationSeconds > 86400
  )
    throw new Error("Invalid playback progress.");
  await setDoc(historyDocument(database, userId, movie.id), {
    id: movie.id,
    title: movie.title || "",
    subtitle: movie.subtitle || "",
    rating: movie.rating || "0.0",
    posterImage: movie.posterImage || movie.image || "",
    server,
    positionSeconds,
    durationSeconds,
    completed: Boolean(completed),
    lastWatchedAt: new Date().toISOString(),
  });
}

export const finishWatchHistory = (database, userId, movieId) =>
  updateDoc(historyDocument(database, userId, movieId), { completed: true });
export const markWatchHistoryUnfinished = (database, userId, movieId) =>
  updateDoc(historyDocument(database, userId, movieId), { completed: false });
export const removeWatchHistory = (database, userId, movieId) =>
  deleteDoc(historyDocument(database, userId, movieId));
