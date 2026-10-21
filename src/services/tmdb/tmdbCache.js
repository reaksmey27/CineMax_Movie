// ─── Cache: keys, read & write helpers ────────────────────────────────────────

const responseCache = new Map();
const pendingRequests = new Map();

export const buildCacheKey = (endpoint, params) => {
  const sortedParams = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify([endpoint, sortedParams]);
};

export const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const getCachedResponse = (cacheKey) => {
  const cached = responseCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cached.data;
};

export const setCachedResponse = (cacheKey, data, ttl) => {
  responseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

export const getPendingRequest = (cacheKey) =>
  pendingRequests.get(cacheKey) ?? null;

export const setPendingRequest = (cacheKey, request) => {
  pendingRequests.set(cacheKey, request);
};

export const deletePendingRequest = (cacheKey) => {
  pendingRequests.delete(cacheKey);
};
