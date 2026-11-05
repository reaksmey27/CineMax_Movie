// Watched status is earned by real playback, measured against the duration the
// player reports for the whole media file (credits and sponsor segments included).
export const COMPLETION_RATIO = 0.9;
const MAX_DURATION_SECONDS = 86400;
const MAX_RANGES = 100;
// Wall-clock slack allowed between two samples before a jump counts as a seek.
const CLOCK_TOLERANCE_SECONDS = 1.5;

export function isValidDuration(value) {
  return Number.isFinite(value) && value > 0 && value <= MAX_DURATION_SECONDS;
}

// Sorted, non-overlapping [start, end] intervals of genuinely played video.
export function mergeWatchedRanges(ranges, durationSeconds) {
  const limit = isValidDuration(durationSeconds)
    ? durationSeconds
    : MAX_DURATION_SECONDS;
  const valid = (Array.isArray(ranges) ? ranges : [])
    .filter(
      (range) =>
        Array.isArray(range) &&
        range.length === 2 &&
        Number.isFinite(range[0]) &&
        Number.isFinite(range[1]),
    )
    .map(([start, end]) => {
      const from = Math.max(0, Math.min(start, end, limit));
      const to = Math.max(0, Math.min(Math.max(start, end), limit));
      return [from, to];
    })
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of valid) {
    const last = merged.at(-1);
    if (last && start <= last[1] + 0.001) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged.length > MAX_RANGES ? merged.slice(-MAX_RANGES) : merged;
}

export function watchedSecondsFromRanges(ranges, durationSeconds) {
  return mergeWatchedRanges(ranges, durationSeconds).reduce(
    (total, [start, end]) => total + (end - start),
    0,
  );
}

export function completionPercent(watchedSeconds, durationSeconds) {
  if (!isValidDuration(durationSeconds)) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100)),
  );
}

export function isCompletionReached(watchedSeconds, durationSeconds) {
  if (!isValidDuration(durationSeconds)) return false;
  // A tiny tolerance keeps float multiplication from missing the exact 90% mark.
  return watchedSeconds >= durationSeconds * COMPLETION_RATIO - 0.001;
}

// Accumulates playback evidence for one movie. Coverage survives reloads
// because the saved ranges are passed back in when the player reopens.
export function createPlaybackTracker(initial = {}) {
  let durationSeconds = isValidDuration(initial.durationSeconds)
    ? initial.durationSeconds
    : 0;
  let ranges = mergeWatchedRanges(initial.watchedRanges, durationSeconds);
  let finished = initial.completed === true;
  let last = null;

  const snapshot = () => {
    const watchedSeconds = watchedSecondsFromRanges(ranges, durationSeconds);
    return {
      durationSeconds,
      watchedSeconds,
      watchedRanges: ranges,
      completionPercent: finished
        ? 100
        : completionPercent(watchedSeconds, durationSeconds),
      completed:
        finished || isCompletionReached(watchedSeconds, durationSeconds),
    };
  };

  const sample = (progress = {}, now = Date.now()) => {
    const position = Number.isFinite(progress.positionSeconds)
      ? Math.max(0, progress.positionSeconds)
      : null;
    if (isValidDuration(progress.durationSeconds)) {
      // The player can report the real duration late; the threshold follows it.
      durationSeconds = progress.durationSeconds;
      ranges = mergeWatchedRanges(ranges, durationSeconds);
    }
    if (progress.completed) {
      // The player itself said the whole file played through, including extras.
      finished = true;
      if (durationSeconds)
        ranges = mergeWatchedRanges(
          [...ranges, [0, durationSeconds]],
          durationSeconds,
        );
    } else if (
      position !== null &&
      progress.playing === true &&
      last?.playing
    ) {
      const elapsed = Math.max(0, (now - last.at) / 1000);
      const advanced = position - last.positionSeconds;
      // Played time is the reported advance. A bigger advance than the elapsed
      // wall clock is a seek, so only the time actually spent playing counts.
      const counted =
        advanced <= 0
          ? 0
          : advanced <= elapsed + CLOCK_TOLERANCE_SECONDS
            ? advanced
            : elapsed;
      if (counted > 0)
        ranges = mergeWatchedRanges(
          [...ranges, [last.positionSeconds, last.positionSeconds + counted]],
          durationSeconds,
        );
    }
    if (position !== null)
      last = {
        positionSeconds: position,
        at: now,
        playing: progress.playing === true && !progress.completed,
      };
    return snapshot();
  };

  return { sample, snapshot };
}
