// src/services/search-service.js — loads the generated search index
// (src/data/search-index.json, built by tools/build-search-index.js) and
// scores matches. Does not build/write the index itself.

import { loadJSON } from "../core/loader.js";
import { config } from "../app/config.js";

let indexPromise = null;

function getIndex() {
  if (!indexPromise) indexPromise = loadJSON(config.searchIndexPath).catch(() => ({ entries: [] }));
  return indexPromise;
}

/**
 * Ranking approximates README's documented factors: exact title match,
 * keyword match, subject match, then general content relevance.
 */
export function scoreEntry(entry, queryLower, queryTokens) {
  let score = 0;
  const title = (entry.title || "").toLowerCase();
  if (title === queryLower) score += 100;
  else if (title.startsWith(queryLower)) score += 60;
  else if (title.includes(queryLower)) score += 30;

  for (const token of queryTokens) {
    if ((entry.keywords || []).some((k) => k.toLowerCase() === token)) score += 15;
    if (title.includes(token)) score += 8;
    if ((entry.subject || "").toLowerCase().includes(token)) score += 5;
    if ((entry.content || "").toLowerCase().includes(token)) score += 2;
  }
  return score;
}

export async function search(query, { limit = 20, entries: providedEntries = null } = {}) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { entries = [] } = providedEntries ? { entries: providedEntries } : await getIndex();
  const queryLower = trimmed.toLowerCase();
  const queryTokens = queryLower.split(/\s+/).filter(Boolean);

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, queryLower, queryTokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
