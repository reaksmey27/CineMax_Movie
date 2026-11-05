import {
  collection,
  deleteDoc,
  getDocsFromServer,
  writeBatch,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  completionPercent,
  mergeWatchedRanges,
  watchedSecondsFromRanges,
} from "../utils/player/watchTracking.js";

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
  const watchedRanges = mergeWatchedRanges(
    details.watchedRanges,
    durationSeconds,
  );
  const watchedSeconds = watchedSecondsFromRanges(
    watchedRanges,
    durationSeconds,
  );
  await setDoc(historyDocument(database, userId, movie.id), {
    id: movie.id,
    title: movie.title || "",
    subtitle: movie.subtitle || "",
    rating: movie.rating || "0.0",
    posterImage: movie.posterImage || movie.image || "",
    server,
    positionSeconds,
    durationSeconds,
    watchedSeconds,
    watchedRanges,
    completionPercent: completed
      ? 100
      : completionPercent(watchedSeconds, durationSeconds),
    completed: Boolean(completed),
    runtimeMinutes:
      Number.isFinite(movie.runtimeMinutes) && movie.runtimeMinutes > 0
        ? movie.runtimeMinutes
        : 0,
    genres: Array.isArray(movie.genres)
      ? movie.genres.filter((genre) => typeof genre === "string")
      : [],
    lastWatchedAt: new Date().toISOString(),
  });
}

export const finishWatchHistory = (database, userId, movieId) =>
  updateDoc(historyDocument(database, userId, movieId), {
    completed: true,
    completionPercent: 100,
  });

export async function setMovieWatched(database, userId, movie, completed) {
  const reference = historyDocument(database, userId, movie.id);
  await runTransaction(database, async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists()) {
      // Preserve saved playback progress, server and metadata, even outside the latest 50.
      transaction.update(reference, {
        completed: Boolean(completed),
        ...(completed
          ? {
              lastWatchedAt: new Date().toISOString(),
              completionPercent: 100,
            }
          : { watchedSeconds: 0, watchedRanges: [], completionPercent: 0 }),
      });
    } else {
      transaction.set(reference, {
        id: movie.id,
        title: movie.title || "",
        subtitle: movie.subtitle || "",
        rating: movie.rating || "0.0",
        posterImage: movie.posterImage || movie.image || "",
        runtimeMinutes:
          Number.isFinite(movie.runtimeMinutes) && movie.runtimeMinutes > 0
            ? movie.runtimeMinutes
            : 0,
        genres: Array.isArray(movie.genres)
          ? movie.genres.filter((genre) => typeof genre === "string")
          : [],
        server: "Server 1",
        positionSeconds: 0,
        durationSeconds: 0,
        watchedSeconds: 0,
        watchedRanges: [],
        completionPercent: completed ? 100 : 0,
        completed: Boolean(completed),
        lastWatchedAt: new Date().toISOString(),
      });
    }
  });
}
export const markWatchHistoryUnfinished = (database, userId, movieId) =>
  updateDoc(historyDocument(database, userId, movieId), {
    completed: false,
    watchedSeconds: 0,
    watchedRanges: [],
    completionPercent: 0,
  });
export const removeWatchHistory = (database, userId, movieId) =>
  deleteDoc(historyDocument(database, userId, movieId));

export async function clearWatchHistory(database, userId) {
  // Read the entire collection, including records beyond the latest 50 shown.
  // A fixed snapshot avoids chasing records created by another device.
  const snapshot = await getDocsFromServer(historyCollection(database, userId));
  for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
    const batch = writeBatch(database);
    snapshot.docs
      .slice(offset, offset + 400)
      .forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}
