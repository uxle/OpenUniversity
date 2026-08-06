// src/engines/recommendation-engine.js — simple, explainable heuristics
// (not ML): related lessons by sub-subject proximity, weak topics from
// recorded MCQ performance.

import { listLessons } from "./subject-engine.js";
import { getLearningStatistics } from "./progress-engine.js";

export async function getRelatedLessons(subjectId, subSubjectId, currentLessonId, limit = 3) {
  const lessons = await listLessons(subjectId, subSubjectId);
  return lessons.filter((id) => id !== currentLessonId).slice(0, limit);
}

export async function getWeakTopicSuggestions(limit = 5) {
  const { weakTopics } = await getLearningStatistics();
  return weakTopics.slice(0, limit);
}
