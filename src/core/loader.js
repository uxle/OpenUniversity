// src/core/loader.js — fetch wrapper for content/data files.
// Reads existing .json/.zl/registry files at runtime; does not author them.

import { createCache } from "./cache.js";
import { createLogger } from "./logger.js";

const log = createLogger("loader");
const textCache = createCache();
const jsonCache = createCache();

export async function loadText(url, { cache = true } = {}) {
  if (cache) {
    const cached = textCache.get(url);
    if (cached !== undefined) return cached;
  }
  const res = await fetch(url);
  if (!res.ok) {
    log.warn(`failed to load text: ${url} (${res.status})`);
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  const text = await res.text();
  if (cache) textCache.set(url, text);
  return text;
}

export async function loadJSON(url, { cache = true } = {}) {
  if (cache) {
    const cached = jsonCache.get(url);
    if (cached !== undefined) return cached;
  }
  const res = await fetch(url);
  if (!res.ok) {
    log.warn(`failed to load JSON: ${url} (${res.status})`);
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  const data = await res.json();
  if (cache) jsonCache.set(url, data);
  return data;
}

export function clearLoaderCache() {
  textCache.clear();
  jsonCache.clear();
}
