// src/engines/progress-engine.js — shapes progress-service data into the
// "Learning Statistics" structure documented in the README.

import { computeStats, getAllProgress, getLessonProgress, markLessonComplete, recordMcqScore } from "../services/progress-service.js";

export { markLessonComplete, recordMcqScore, getLessonProgress };

export async function getLearningStatistics() {
  const [stats, records] = await Promise.all([computeStats(), getAllProgress()]);
  const bySubject = records.reduce((acc, r) => {
    (acc[r.subjectId] ||= []).push(r);
    return acc;
  }, {});
  const subjectProgress = Object.fromEntries(
    Object.entries(bySubject).map(([subjectId, recs]) => [
      subjectId,
      recs.filter((r) => r.completed).length / recs.length,
    ])
  );

  const scored = records.filter((r) => typeof r.score === "number");
  const weakTopics = scored.filter((r) => r.score < 0.6).map((r) => r.lessonId);
  const strongTopics = scored.filter((r) => r.score >= 0.85).map((r) => r.lessonId);

  return { ...stats, subjectProgress, weakTopics, strongTopics };
}
