// src/services/progress-service.js — business rules over progress-storage.

import {
  getAllProgress, getLessonProgress, saveLessonProgress,
} from "../storage/progress-storage.js";
import { isConsecutiveDay, isSameDay, toDateKey } from "../utils/dates.js";
import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../app/constants.js";

export { getAllProgress, getLessonProgress };

export async function markLessonComplete(subjectId, subSubjectId, lessonId) {
  const updated = await saveLessonProgress(subjectId, subSubjectId, lessonId, {
    completed: true,
    lastStudied: new Date().toISOString(),
  });
  eventBus.emit(EVENTS.PROGRESS_UPDATED, updated);
  return updated;
}

export async function recordMcqScore(subjectId, subSubjectId, lessonId, correct, total) {
  const existing = await getLessonProgress(subjectId, subSubjectId, lessonId);
  const updated = await saveLessonProgress(subjectId, subSubjectId, lessonId, {
    score: total ? correct / total : 0,
    attempts: (existing?.attempts || 0) + 1,
    lastStudied: new Date().toISOString(),
  });
  eventBus.emit(EVENTS.PROGRESS_UPDATED, updated);
  return updated;
}

/** Consecutive-day streak based on lastStudied timestamps across all records. */
export async function computeStreak(records = null) {
  records = records || await getAllProgress();
  const studyDates = [...new Set(
    records.filter((r) => r.lastStudied).map((r) => toDateKey(new Date(r.lastStudied)))
  )].sort();
  if (studyDates.length === 0) return 0;

  let streak = 1;
  for (let i = studyDates.length - 1; i > 0; i--) {
    if (isConsecutiveDay(studyDates[i - 1], studyDates[i])) streak++;
    else break;
  }
  const today = new Date();
  const mostRecent = new Date(studyDates[studyDates.length - 1]);
  const gap = Math.abs(Math.round((today - mostRecent) / (24 * 60 * 60 * 1000)));
  if (gap > 1 && !isSameDay(mostRecent, today)) return 0; // streak broken
  return streak;
}

export async function computeStats() {
  const records = await getAllProgress();
  const completed = records.filter((r) => r.completed);
  const scored = records.filter((r) => typeof r.score === "number");
  const accuracy = scored.length
    ? scored.reduce((sum, r) => sum + r.score, 0) / scored.length
    : 0;
  return {
    lessonsCompleted: completed.length,
    mcqsAnswered: scored.length,
    accuracy,
    streak: await computeStreak(),
  };
}
