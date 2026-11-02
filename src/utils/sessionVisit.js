const KEY = "cinemax:website-visit:v1";

// Share the pending request across Strict Mode mounts and footer remounts.
export function createVisitLoader({ record, read, storage }) {
  let pending;
  let counted = false;
  return () => {
    if (pending) return pending;
    let saved = counted;
    try {
      saved ||= storage.getItem(KEY) === "counted";
    } catch {
      /* In-memory fallback. */
    }
    pending = (async () => {
      if (saved) return read();
      const count = await record();
      counted = true;
      try {
        storage.setItem(KEY, "counted");
      } catch {
        /* In-memory fallback. */
      }
      return count;
    })().catch((error) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
