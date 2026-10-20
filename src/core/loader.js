// src/core/loader.js — fetch wrapper for content/data files.
// Reads existing .json/.zl/registry files at runtime; does not author them.
//
// Two performance behaviours beyond naive fetch():
// - In-flight dedup: N components requesting the same URL at the same
//   moment share one network request instead of firing N of them (the
//   lesson page fires several parallel loads that overlap on registries).
// - Short-lived negative caching: a missing translation (.es.zl) used to
//   re-404 on every visit/switch. A small TTL "known missing" map turns
//   those repeat misses into instant fallbacks without hiding newly added
//   content for long.

import { createCache } from "./cache.js";
import { createLogger } from "./logger.js";

const log = createLogger("loader");
const NEGATIVE_TTL_MS = 30_000;

const textCache = createCache();
const jsonCache = createCache();
const negativeCache = createCache({ ttlMs: NEGATIVE_TTL_MS });
const inflight = new Map();

async function request(url, { as }) {
  const res = await fetch(url);
  if (!res.ok) {
    log.warn(`failed to load ${as}: ${url} (${res.status})`);
    // Only cache *expected* absences (404). Server errors stay uncached.
    if (res.status === 404) negativeCache.set(url, true);
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  const data = await (as === "json" ? res.json() : res.text());
  return data;
}

function load(url, { as, cache = true, cacheStore }) {
  if (cache) {
    const cached = cacheStore.get(url);
    if (cached !== undefined) return Promise.resolve(cached);
    if (negativeCache.get(url)) {
      return Promise.reject(new Error(`Failed to load ${url}: 404 (cached)`));
    }
    const pending = inflight.get(url);
    if (pending) return pending;
  }
  const promise = request(url, { as })
    .then((data) => {
      if (cache) cacheStore.set(url, data);
      return data;
    })
    .finally(() => {
      if (cache) inflight.delete(url);
    });
  if (cache) inflight.set(url, promise);
  return promise;
}

export async function loadText(url, opts = {}) {
  return load(url, { ...opts, as: "text", cacheStore: textCache });
}

export async function loadJSON(url, opts = {}) {
  return load(url, { ...opts, as: "json", cacheStore: jsonCache });
}

export function clearLoaderCache() {
  textCache.clear();
  jsonCache.clear();
  negativeCache.clear();
  inflight.clear();
}
