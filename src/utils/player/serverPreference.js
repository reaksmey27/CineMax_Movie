import { SERVERS } from "../../config/playerServers";

const STORAGE_KEY = "cinemax_preferred_movie_server";

export function readPreferredServer() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SERVERS.some((server) => server.name === saved)) return saved;
  } catch {
    // Playback remains available when browser storage is blocked.
  }
  return SERVERS[0].name;
}

export function savePreferredServer(name) {
  if (!SERVERS.some((server) => server.name === name)) return;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Keep the selected server for this visit even without persistence.
  }
}
