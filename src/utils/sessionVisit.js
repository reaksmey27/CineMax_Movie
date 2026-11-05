const KEY = "cinemax:website-visit:v2";
// A visit lasts while the visitor keeps browsing. A break longer than this
// starts a new visit, the way a repeat view counts again on a video site.
export const VISIT_TIMEOUT_MS = 30 * 60 * 1000;

// Share the pending request across Strict Mode mounts and footer remounts.
export function createVisitLoader({ record, read, storage, now = Date.now }) {
  let pending;
  let counted = false;
  const lastSeen = () => {
    try {
      const value = Number(storage.getItem(KEY));
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      /* In-memory fallback. */
      return null;
    }
  };
  const markSeen = (time) => {
    try {
      storage.setItem(KEY, String(time));
    } catch {
      /* In-memory fallback. */
    }
  };
  return () => {
    if (pending) return pending;
    pending = (async () => {
      const time = now();
      const previous = lastSeen();
      const active =
        counted || (previous !== null && time - previous < VISIT_TIMEOUT_MS);
      const count = active ? await read() : await record();
      if (!active) counted = true;
      markSeen(time);
      return count;
    })().catch((error) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
