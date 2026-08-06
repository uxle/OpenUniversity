// src/engines/search-engine.js — adds a "user history" relevance boost on
// top of search-service's base scoring, using progress records as a signal
// (README lists "user history" as a ranking factor).

import { search as searchIndex } from "../services/search-service.js";
import { getAllProgress } from "../services/progress-service.js";

export async function search(query, opts = {}) {
  const [results, progress] = await Promise.all([
    searchIndex(query, opts),
    getAllProgress().catch(() => []),
  ]);
  const studiedLessonIds = new Set(progress.map((p) => p.lessonId));
  return results
    .map((entry) => ({ ...entry, _historyBoost: studiedLessonIds.has(entry.lessonId) ? 1 : 0 }))
    .sort((a, b) => b._historyBoost - a._historyBoost);
}
