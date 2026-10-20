// src/services/search-service.js — loads the generated search index
// (src/data/search-index.json, built by tools/build-search-index.js) and
// scores matches. Does not build/write the index itself.

import { loadJSON } from "../core/loader.js";
import { config } from "../app/config.js";

let indexPromise = null;

/**
 * Lowercased fields are computed once when the index arrives. Scoring
 * runs per keystroke over ~300+ entries; lowercasing every entry's full
 * content string for every token of every query was measurable waste.
 */
function prepareEntries(entries) {
  for (const entry of entries) {
    entry._titleLower = (entry.title || "").toLowerCase();
    entry._subjectLower = (entry.subject || "").toLowerCase();
    entry._contentLower = (entry.content || "").toLowerCase();
    entry._keywordsLower = (entry.keywords || []).map((k) => k.toLowerCase());
  }
  return entries;
}

function getIndex() {
  if (!indexPromise) {
    indexPromise = loadJSON(config.searchIndexPath)
      .then(({ entries }) => ({ entries: prepareEntries(entries || []) }))
      .catch(() => {
        // Reset so the NEXT query retries the fetch instead of this
        // session being permanently stuck on an empty index because one
        // request failed.
        indexPromise = null;
        return { entries: [] };
      });
  }
  return indexPromise;
}

/**
 * Kick off the index load without waiting for it — called from
 * bootstrap's idle-time prefetch so the first real search is instant.
 */
export function warmSearchIndex() {
  return getIndex();
}

/**
 * Ranking approximates README's documented factors: exact title match,
 * keyword match, subject match, then general content relevance.
 */
export function scoreEntry(entry, queryLower, queryTokens) {
  let score = 0;
  const title = entry._titleLower ?? (entry.title || "").toLowerCase();
  if (title === queryLower) score += 100;
  else if (title.startsWith(queryLower)) score += 60;
  else if (title.includes(queryLower)) score += 30;

  for (const token of queryTokens) {
    const keywords = entry._keywordsLower
      || (entry.keywords || []).map((k) => k.toLowerCase());
    if (keywords.some((k) => k === token)) score += 15;
    if (title.includes(token)) score += 8;
    const subject = entry._subjectLower ?? (entry.subject || "").toLowerCase();
    if (subject.includes(token)) score += 5;
    const content = entry._contentLower ?? (entry.content || "").toLowerCase();
    if (content.includes(token)) score += 2;
  }
  return score;
}

/**
 * Same ranking as search(), but returns [{ ...entry, score }] pairs.
 * Pass `limit: -1` for the full ranked list (used by engines that need
 * all candidates before applying their own boosts).
 */
export async function searchScored(query, { limit = 20, entries: providedEntries = null } = {}) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { entries = [] } = providedEntries ? { entries: providedEntries } : await getIndex();
  const queryLower = trimmed.toLowerCase();
  const queryTokens = queryLower.split(/\s+/).filter(Boolean);

  const scored = [];
  for (const entry of entries) {
    const score = scoreEntry(entry, queryLower, queryTokens);
    if (score > 0) scored.push({ ...entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return limit < 0 ? scored : scored.slice(0, limit);
}

export async function search(query, opts = {}) {
  const scored = await searchScored(query, opts);
  return scored.map(({ score, ...entry }) => entry);
}
