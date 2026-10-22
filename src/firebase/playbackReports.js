import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

export const PLAYBACK_ISSUES = ["not-loading", "no-sound", "wrong-movie"];

export async function submitPlaybackReport(
  database,
  userId,
  movie,
  server,
  issue,
) {
  if (
    !userId ||
    !Number.isSafeInteger(movie.id) ||
    movie.id <= 0 ||
    !/^Server [1-4]$/.test(server) ||
    !PLAYBACK_ISSUES.includes(issue)
  ) {
    throw new Error("Invalid playback report.");
  }
  const ref = doc(
    database,
    "playbackReports",
    userId,
    "reports",
    `${movie.id}-${server.slice(-1)}-${issue}`,
  );
  await runTransaction(database, async (transaction) => {
    if ((await transaction.get(ref)).exists()) return;
    transaction.set(ref, {
      movieId: movie.id,
      movieTitle: String(movie.title || "").slice(0, 300),
      server,
      issue,
      createdAt: serverTimestamp(),
    });
  });
}
