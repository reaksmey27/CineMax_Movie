import {
  deleteField,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export async function clearSavedMovies(database, userId, collection, movieIds) {
  if (
    !userId ||
    !["favorites", "watchlists"].includes(collection) ||
    !Array.isArray(movieIds) ||
    movieIds.some((id) => !Number.isSafeInteger(id) || id <= 0)
  ) {
    throw new Error(
      "A user, saved collection and valid movie IDs are required.",
    );
  }
  if (!movieIds.length) return;
  const reference = doc(database, collection, userId);
  await runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) return;
    const movies = snapshot.data().movies || {};
    const changes = {};
    for (const id of movieIds) {
      if (Object.hasOwn(movies, id)) changes[`movies.${id}`] = deleteField();
    }
    if (Object.keys(changes).length) {
      transaction.update(reference, {
        ...changes,
        updatedAt: serverTimestamp(),
      });
    }
  });
}
