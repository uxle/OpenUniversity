// src/services/lesson-title-service.js — resolves lessonIds to human
// titles using search-index.json (one cached JSON fetch).
//
// Why this exists: the subject / sub-subject / related-lesson listings
// each fetched EVERY lesson's full .zl source purely to regex out its
// "# Title" heading — dozens of sequential-ish requests to render one
// list on subjects like reasoning/coding-decoding (22 lessons). The same
// titles are already present in the generated search index, which rides
// the loader's shared cache, so one request serves every listing page.

import { loadJSON } from "../core/loader.js";
import { config } from "../app/config.js";

let titlesPromise = null;

function keyOf(subjectId, subSubjectId, lessonId) {
  return `${subjectId}::${subSubjectId || ""}::${lessonId}`;
}

export function getTitleLookup() {
  if (!titlesPromise) {
    titlesPromise = loadJSON(config.searchIndexPath)
      .then(({ entries = [] }) => {
        const map = new Map();
        for (const entry of entries) {
          const key = keyOf(entry.subjectId, entry.subSubjectId, entry.lessonId);
          if (!map.has(key)) map.set(key, entry.title || entry.lessonId);
        }
        return map;
      })
      .catch(() => {
        titlesPromise = null; // allow retry on next use
        return new Map();
      });
  }
  return titlesPromise;
}

/**
 * @param {string} subjectId
 * @param {string|undefined} subSubjectId
 * @param {string[]} lessonIds
 * @returns {Promise<{id: string, title: string}[]>} falls back to the raw
 *   lessonId when the index has no entry (e.g. a brand-new lesson added
 *   without rebuilding the index yet).
 */
export async function resolveLessonTitles(subjectId, subSubjectId, lessonIds) {
  const titles = await getTitleLookup();
  return lessonIds.map((id) => ({
    id,
    title: titles.get(keyOf(subjectId, subSubjectId, id)) || id,
  }));
}
