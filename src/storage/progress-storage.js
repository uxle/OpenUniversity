// src/storage/progress-storage.js — per-lesson progress records.
// Record shape: { id, subjectId, subSubjectId, lessonId, completed,
//                 score, attempts, lastStudied }

import { getAll, get, put, remove } from "./indexed-db.js";

function recordId(subjectId, subSubjectId, lessonId) {
  return `${subjectId}/${subSubjectId}/${lessonId}`;
}

export async function getAllProgress() {
  return getAll("progress");
}

export async function getLessonProgress(subjectId, subSubjectId, lessonId) {
  return get("progress", recordId(subjectId, subSubjectId, lessonId));
}

export async function saveLessonProgress(subjectId, subSubjectId, lessonId, patch) {
  const id = recordId(subjectId, subSubjectId, lessonId);
  const existing = (await get("progress", id)) || {
    id, subjectId, subSubjectId, lessonId,
    completed: false, score: null, attempts: 0, lastStudied: null,
  };
  const updated = { ...existing, ...patch, id };
  await put("progress", updated);
  return updated;
}

export async function deleteLessonProgress(subjectId, subSubjectId, lessonId) {
  return remove("progress", recordId(subjectId, subSubjectId, lessonId));
}
