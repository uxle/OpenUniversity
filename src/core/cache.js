// src/core/cache.js — in-memory cache with optional TTL, used by services
// (zolto-service, content-service) to avoid re-fetching/re-compiling.
//
// Bounded by maxEntries (default 200): a long browsing session across the
// platform's hundreds of lessons/languages would otherwise let this Map
// grow without limit for the lifetime of the tab. Eviction is plain
// least-recently-used, approximated by Map's own insertion-order
// iteration — re-inserting a key on every get() moves it to the "most
// recently used" end, so the first key in iteration order is always the
// next one to evict.

const DEFAULT_MAX_ENTRIES = 200;

export function createCache({ ttlMs = null, maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
  const store = new Map();

  function touch(key, entry) {
    // Re-insert so this key becomes the most-recently-used for eviction
    // purposes (Map preserves insertion order; delete+set moves it to
    // the end without changing the stored value).
    store.delete(key);
    store.set(key, entry);
  }

  function set(key, value) {
    const entry = { value, expiresAt: ttlMs ? Date.now() + ttlMs : null };
    store.delete(key);
    store.set(key, entry);
    while (store.size > maxEntries) {
      const oldestKey = store.keys().next().value;
      store.delete(oldestKey);
    }
    return value;
  }

  function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    touch(key, entry);
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
