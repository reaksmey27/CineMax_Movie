import assert from "node:assert/strict";
import test from "node:test";
import {
  completionPercent,
  createPlaybackTracker,
  mergeWatchedRanges,
  watchedSecondsFromRanges,
} from "../src/utils/player/watchTracking.js";

// Feeds the tracker genuine "playing" samples: each second of wall-clock time
// advances the reported position by one second, like a real player.
function play(tracker, from, seconds, duration, { now = 0, step = 5 } = {}) {
  let position = from;
  let clock = now;
  tracker.sample(
    { positionSeconds: position, durationSeconds: duration, playing: true },
    clock,
  );
  const end = from + seconds;
  while (position < end) {
    const advance = Math.min(step, end - position);
    clock += advance * 1000;
    position += advance;
    tracker.sample(
      { positionSeconds: position, durationSeconds: duration, playing: true },
      clock,
    );
  }
  return { position, now: clock };
}

test("marks watched only at 90% of the actual video duration", () => {
  const ninetyMinutes = 90 * 60;
  const watched = createPlaybackTracker();
  const after80 = play(watched, 0, 80 * 60, ninetyMinutes);
  assert.equal(watched.snapshot().completed, false);
  assert.equal(watched.snapshot().completionPercent, 89);
  const after81 = play(watched, 80 * 60, 60, ninetyMinutes, {
    now: after80.now,
  });
  assert.equal(watched.snapshot().completed, true);
  assert.equal(watched.snapshot().completionPercent, 90);
  assert.ok(watched.snapshot().watchedSeconds >= 81 * 60);
  assert.ok(after81.position >= 81 * 60);
});

test("keeps tracking a sponsor or credits segment after the story ends", () => {
  const completeDuration = 90 * 60;
  const tracker = createPlaybackTracker();
  // The story ends at 80 minutes; the file itself runs 90 minutes.
  const story = play(tracker, 0, 80 * 60, completeDuration);
  const trackerAfterStory = tracker.snapshot();
  assert.equal(trackerAfterStory.completed, false);
  assert.equal(trackerAfterStory.watchedSeconds, 80 * 60);
  // Watching one more minute of the sponsor segment crosses the threshold.
  play(tracker, 80 * 60, 60, completeDuration, { now: story.now });
  assert.equal(tracker.snapshot().completed, true);
});

test("uses the actual 110 minutes when the listed movie is 120 minutes", () => {
  const actual = 110 * 60;
  const tracker = createPlaybackTracker();
  const eightyEight = play(tracker, 0, 88 * 60, actual);
  assert.equal(tracker.snapshot().completed, false);
  // 99 minutes is 90% of 110 minutes, so the 120 minute listing is ignored.
  play(tracker, 88 * 60, 11 * 60, actual, { now: eightyEight.now });
  assert.equal(tracker.snapshot().completed, true);
});

test("does not count paused, buffering or background time", () => {
  const tracker = createPlaybackTracker();
  const played = play(tracker, 0, 70 * 60, 5400, { now: 0 });
  tracker.sample(
    { positionSeconds: 70 * 60, durationSeconds: 5400, playing: false },
    played.now,
  );
  // Ten minutes later the user resumes from the same position.
  const resumed = play(tracker, 70 * 60, 5, 5400, {
    now: played.now + 10 * 60 * 1000,
  });
  assert.equal(tracker.snapshot().completed, false);
  // Buffering leaves the position unchanged, so no time is credited.
  tracker.sample(
    { positionSeconds: resumed.position, durationSeconds: 5400, playing: true },
    resumed.now + 30 * 1000,
  );
  tracker.sample(
    { positionSeconds: resumed.position, durationSeconds: 5400, playing: true },
    resumed.now + 60 * 1000,
  );
  assert.equal(tracker.snapshot().watchedSeconds, 70 * 60 + 5);
});

test("credits playback reported in sparse events", () => {
  const tracker = createPlaybackTracker();
  tracker.sample(
    { positionSeconds: 0, durationSeconds: 5400, playing: true },
    0,
  );
  // The provider reports again ten minutes later, still playing.
  tracker.sample(
    { positionSeconds: 600, durationSeconds: 5400, playing: true },
    10 * 60 * 1000,
  );
  assert.equal(tracker.snapshot().watchedSeconds, 600);
});

test("seeking to 90% never completes the movie", () => {
  const tracker = createPlaybackTracker();
  const played = play(tracker, 0, 60, 5400);
  const target = Math.floor(5400 * 0.9);
  // The player reports a seek jump, then playback resumes at 90%.
  tracker.sample(
    { positionSeconds: target, durationSeconds: 5400, playing: false },
    played.now,
  );
  const resumed = play(tracker, target, 30, 5400, { now: played.now });
  assert.equal(tracker.snapshot().watchedSeconds, 90);
  assert.equal(tracker.snapshot().completed, false);
  assert.equal(resumed.position, target + 30);
});

test("a forward jump reported without a seek event is clamped", () => {
  const tracker = createPlaybackTracker();
  tracker.sample(
    { positionSeconds: 0, durationSeconds: 5400, playing: true },
    0,
  );
  tracker.sample(
    { positionSeconds: 4860, durationSeconds: 5400, playing: true },
    1000,
  );
  assert.ok(tracker.snapshot().watchedSeconds <= 3);
  assert.equal(tracker.snapshot().completed, false);
});

test("restores coverage after a refresh and completes on later playback", () => {
  const first = createPlaybackTracker();
  play(first, 0, 50 * 60, 5400);
  const saved = first.snapshot();
  assert.equal(saved.completed, false);
  const second = createPlaybackTracker(saved);
  // Resuming at 50% does not credit the skipped part again.
  const resumed = play(second, 50 * 60, 0, 5400, {
    now: saved.watchedSeconds * 1000,
  });
  assert.equal(second.snapshot().watchedSeconds, 50 * 60);
  play(second, 50 * 60, 31 * 60, 5400, { now: resumed.now });
  assert.equal(second.snapshot().completed, true);
});

test("never double counts a rewatched interval", () => {
  const tracker = createPlaybackTracker();
  play(tracker, 0, 60, 5400);
  play(tracker, 0, 60, 5400, { now: 10 * 60 * 1000 });
  assert.equal(tracker.snapshot().watchedSeconds, 60);
  assert.equal(
    watchedSecondsFromRanges([
      [0, 100],
      [100, 200],
      [300, 350],
      [275, 325],
    ]),
    275,
  );
  assert.deepEqual(
    mergeWatchedRanges([
      [300, 350],
      [0, 100],
      [275, 325],
    ]),
    [
      [0, 100],
      [275, 350],
    ],
  );
});

test("recalculates the threshold when the real duration arrives late", () => {
  const tracker = createPlaybackTracker();
  play(tracker, 0, 4800, 0);
  assert.equal(tracker.snapshot().completed, false);
  assert.equal(tracker.snapshot().completionPercent, 0);
  // Later metadata reveals a 90 minute file: 81 minutes is required.
  tracker.sample({
    positionSeconds: 4800,
    durationSeconds: 5400,
    playing: true,
  });
  assert.equal(tracker.snapshot().completed, false);
  assert.equal(tracker.snapshot().completionPercent, 89);
  play(tracker, 4800, 60, 5400, { now: 4800 * 1000 });
  assert.equal(tracker.snapshot().completed, true);
});

test("an explicit completed event finishes the movie even without duration", () => {
  const tracker = createPlaybackTracker();
  const snapshot = tracker.sample({
    positionSeconds: 7200,
    durationSeconds: 7200,
    completed: true,
  });
  assert.equal(snapshot.completed, true);
  assert.equal(snapshot.completionPercent, 100);
  assert.deepEqual(snapshot.watchedRanges, [[0, 7200]]);
  assert.equal(
    createPlaybackTracker().sample({
      positionSeconds: 0,
      durationSeconds: 0,
      completed: true,
    }).completed,
    true,
  );
});

test("an already watched movie stays watched and invalid data is harmless", () => {
  const tracker = createPlaybackTracker({ completed: true, watchedRanges: [] });
  assert.equal(tracker.snapshot().completed, true);
  assert.equal(tracker.snapshot().completionPercent, 100);
  for (const duration of [0, -5, NaN, Infinity, 90000]) {
    assert.equal(completionPercent(100, duration), 0);
    const invalid = createPlaybackTracker({ durationSeconds: duration });
    play(invalid, 0, 5000, duration);
    assert.equal(invalid.snapshot().completed, false);
  }
  assert.deepEqual(mergeWatchedRanges("nope"), []);
  assert.deepEqual(
    mergeWatchedRanges([
      [NaN, 10],
      [5, 5],
      [0, 20],
    ]),
    [[0, 20]],
  );
});
