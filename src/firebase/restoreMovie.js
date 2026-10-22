import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

// Restore only a missing item, preserving its original metadata. A movie that
// was saved again (possibly on another device) must not be overwritten.
export async function restoreMovie(database, userId, collection, movie) {
  if (
    !userId ||
    !["favorites", "watchlists", "watchHistory"].includes(collection) ||
    !Number.isSafeInteger(movie?.id) ||
    movie.id <= 0
  )
    throw new Error("Invalid restore request.");
  const history = collection === "watchHistory";
  const reference = history
    ? doc(database, collection, userId, "movies", String(movie.id))
    : doc(database, collection, userId);
  await runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (history) {
      if (!snapshot.exists()) transaction.set(reference, movie);
    } else if (!snapshot.data()?.movies?.[movie.id]) {
      transaction.set(
        reference,
        { userId, movies: { [movie.id]: movie }, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }
  });
}
