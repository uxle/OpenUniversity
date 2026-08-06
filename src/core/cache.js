// src/core/cache.js — in-memory cache with optional TTL, used by services
// (zolto-service, content-service) to avoid re-fetching/re-compiling.

export function createCache({ ttlMs = null } = {}) {
  const store = new Map();

  function set(key, value) {
    store.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null });
    return value;
  }

  function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  function has(key) {
    return get(key) !== undefined;
  }

  function del(key) {
    store.delete(key);
  }

  function clear() {
    store.clear();
  }

  /** Get-or-compute helper — the common case for a compile/fetch cache. */
  async function getOrSet(key, factory) {
    if (has(key)) return get(key);
    const value = await factory();
    set(key, value);
    return value;
  }

  return { get, set, has, delete: del, clear, getOrSet };
}
