export function readPlayerProgress(event, frameWindow, server, movieId) {
  if (
    !frameWindow ||
    event.source !== frameWindow ||
    !server.progressOrigins?.includes(event.origin)
  )
    return null;
  let message = event.data;
  if (typeof message === "string") {
    if (message.length > 10000) return null;
    try {
      message = JSON.parse(message);
    } catch {
      return null;
    }
  }
  const data = message?.data;
  if (
    message?.type !== "PLAYER_EVENT" ||
    data?.player_info?.mediaType !== "movie" ||
    String(data.player_info.tmdb) !== String(movieId)
  )
    return null;
  if (
    !["playing", "paused", "seeked", "completed"].includes(data.player_status)
  )
    return null;
  const positionSeconds = data.player_progress;
  const durationSeconds = data.player_duration;
  if (
    !Number.isFinite(positionSeconds) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    durationSeconds > 86400 ||
    positionSeconds < 0 ||
    positionSeconds > durationSeconds + 5
  )
    return null;
  return {
    positionSeconds: Math.min(positionSeconds, durationSeconds),
    durationSeconds,
    completed: data.player_status === "completed",
    force: data.player_status !== "playing",
  };
}

export function formatPlaybackTime(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${minutes}:${remainder}`;
}
