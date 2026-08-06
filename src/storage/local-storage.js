// src/storage/local-storage.js — JSON-safe localStorage wrapper for small
// preference values (theme, language, text size). Bulk records (progress,
// bookmarks, notes) live in IndexedDB — see indexed-db.js.

const PREFIX = "ou:";

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // e.g. private browsing / quota exceeded
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
    return true;
  } catch {
    return false;
  }
}
