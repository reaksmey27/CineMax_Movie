import assert from "node:assert/strict";
import test from "node:test";
import {
  readPlayerProgress,
  formatPlaybackTime,
} from "../src/utils/player/watchProgress.js";
import { SERVERS } from "../src/config/playerServers.js";
const frame = {};
const server = SERVERS[3];
const payload = {
  type: "PLAYER_EVENT",
  data: {
    player_info: { tmdb: 550, mediaType: "movie" },
    player_status: "paused",
    player_progress: 125.4,
    player_duration: 7200,
  },
};
const event = { source: frame, origin: "https://vidsrc.sh", data: payload };
test("trusted player progress supports structured and JSON messages", () => {
  const expected = {
    positionSeconds: 125.4,
    durationSeconds: 7200,
    completed: false,
    force: true,
  };
  assert.deepEqual(readPlayerProgress(event, frame, server, 550), expected);
  assert.deepEqual(
    readPlayerProgress(
      { ...event, data: JSON.stringify(payload) },
      frame,
      server,
      550,
    ),
    expected,
  );
  assert.equal(formatPlaybackTime(125.4), "2:05");
  assert.equal(formatPlaybackTime(7200), "2:00:00");
});
test("ignore spoofed windows, origins, titles and malformed progress", () => {
  for (const invalid of [
    { ...event, source: {} },
    { ...event, origin: "https://attacker.example" },
    { ...event, data: "{" },
    { ...event, data: null },
  ])
    assert.equal(readPlayerProgress(invalid, frame, server, 550), null);
  assert.equal(readPlayerProgress(event, frame, server, 551), null);
  assert.equal(readPlayerProgress(event, frame, SERVERS[0], 550), null);
  for (const value of [-1, Infinity, NaN, "125", 8000])
    assert.equal(
      readPlayerProgress(
        {
          ...event,
          data: {
            ...payload,
            data: { ...payload.data, player_progress: value },
          },
        },
        frame,
        server,
        550,
      ),
      null,
    );
});
test("completion forces a final save", () => {
  const result = readPlayerProgress(
    {
      ...event,
      data: {
        ...payload,
        data: {
          ...payload.data,
          player_status: "completed",
          player_progress: 7201,
        },
      },
    },
    frame,
    server,
    550,
  );
  assert.equal(result.completed, true);
  assert.equal(result.force, true);
  assert.equal(result.positionSeconds, 7200);
});
