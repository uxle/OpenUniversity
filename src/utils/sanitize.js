// src/utils/sanitize.js — defense-in-depth escaping for any user-supplied
// text we inject into the DOM (notes, contribution descriptions, etc.)
// Zolto itself already escapes its own compiled output; this covers the
// content OpenKnowledge renders outside of Zolto.

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/** Strip any tags entirely, for contexts that must be plain text. */
export function stripTags(str) {
  return String(str).replace(/<[^>]*>/g, "");
}

export function sanitizeText(str, { maxLength = 5000 } = {}) {
  return escapeHTML(stripTags(String(str))).slice(0, maxLength);
}
