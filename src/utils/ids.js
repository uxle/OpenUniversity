// src/utils/ids.js — id/slug generation. No external uuid dependency.

export function uid(prefix = "id") {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${random}`;
}

/** RFC4122-ish v4 UUID using crypto when available, falling back otherwise. */
export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Matches subject/sub-subject/lesson ids as they actually appear in
// src/subjects/ (see subject-registry.json / lesson filenames): lowercase
// letters, digits, and hyphens only. Deliberately excludes "/", ".", "%",
// and whitespace so a value built from this check can never escape the
// content directory it's concatenated into (see isSafeContentSegment()).
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * True if `value` is safe to use as one path segment in a content fetch
 * URL (content-service.js). Route params and query strings are
 * user-controlled — a value like "..", "..%2f..%2fapp", or one containing
 * "/" must never reach fetch() unchecked, or it can be used to request
 * same-origin resources outside src/subjects/ (path traversal). Reject
 * anything that isn't a plain slug rather than trying to strip/escape it.
 */
export function isSafeContentSegment(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 128 && SAFE_SLUG_RE.test(value);
}

// Lesson language codes are short and closed-ish (SUPPORTED_LESSON_LANGUAGES)
// but this stays a general shape check here to avoid a circular import on
// app/constants.js; content-service.js still owns the fallback-to-default
// behavior for an unrecognized-but-safe code.
export function isSafeLanguageCode(value) {
  return typeof value === "string" && /^[a-z]{2}(-[a-z]{2})?$/i.test(value);
}
