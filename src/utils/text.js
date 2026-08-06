// src/utils/text.js — plain-text helpers for previews/snippets.

export function truncate(text, length = 140, ellipsis = "…") {
  if (!text || text.length <= length) return text || "";
  return text.slice(0, length).trimEnd() + ellipsis;
}

/** Rough plain-text extraction from Zolto/Markdown source for search snippets. */
export function stripMarkup(source) {
  return String(source)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/@\w+[\s\S]*?@\/\w+/g, " ")
    .replace(/\[\/?[a-z]+[^\]]*\]/gi, " ")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pluralize(word, count, plural = `${word}s`) {
  return count === 1 ? word : plural;
}

export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
