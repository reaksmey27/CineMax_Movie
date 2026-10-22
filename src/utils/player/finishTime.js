export function getRemainingSeconds(runtimeMinutes, progress) {
  const validDuration = (value) =>
    Number.isFinite(value) && value > 0 && value <= 86400;
  const unfinished = progress && !progress.completed;
  const duration =
    unfinished && validDuration(progress.durationSeconds)
      ? progress.durationSeconds
      : validDuration(runtimeMinutes * 60)
        ? runtimeMinutes * 60
        : null;
  if (duration === null) return null;
  const position =
    unfinished &&
    Number.isFinite(progress.positionSeconds) &&
    progress.positionSeconds >= 0
      ? Math.min(progress.positionSeconds, duration)
      : 0;
  return duration - position;
}

export function formatRemainingDuration(seconds, language) {
  const minutes = Math.ceil(seconds / 60);
  const unit = (value, name) =>
    new Intl.NumberFormat(language, {
      style: "unit",
      unit: name,
      unitDisplay: "short",
    }).format(value);
  return minutes >= 60
    ? `${unit(Math.floor(minutes / 60), "hour")} ${unit(minutes % 60, "minute")}`
    : unit(minutes, "minute");
}
