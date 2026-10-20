// src/engines/search-engine.js — adds a "user history" relevance boost on
// top of search-service's base scoring, using progress records as a signal
// (README lists "user history" as *a* ranking factor, not the only one —
// the previous implementation sorted by the boost alone, which threw away
// base relevance ordering and could float a barely-matching studied
// lesson above a strong unstudied match).

import { searchScored } from "../services/search-service.js";
import { getAllProgress } from "../services/progress-service.js";

const HISTORY_BOOST = 10;

export async function search(query, opts = {}) {
  const [candidates, progress] = await Promise.all([
    // Full ranked candidate list — the limit is applied here, after
    // boosting, so strong matches aren't cut before they can be promoted.
    searchScored(query, { entries: opts.entries ?? null, limit: -1 }),
    getAllProgress().catch(() => []),
  ]);
  const studiedLessonIds = new Set(progress.map((p) => p.lessonId));
  const boosted = candidates.map((entry) => ({
    ...entry,
    _historyBoost: studiedLessonIds.has(entry.lessonId) ? HISTORY_BOOST : 0,
  }));
  boosted.sort((a, b) => (b.score + b._historyBoost) - (a.score + a._historyBoost));
  const limit = opts.limit ?? 20;
  return (limit < 0 ? boosted : boosted.slice(0, limit))
    .map(({ score, _historyBoost, ...entry }) => entry);
}
