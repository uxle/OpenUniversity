// src/components/lesson/last-lesson.js — "continue where you left off".
//
// Records the most recently opened lesson (not completed ones — the
// progress ring already celebrates those) so the home page can offer a
// one-click jump back. Storage contract: single JSON blob under the
// "lastLesson" preference key; readers must tolerate absent/corrupt
// values (first visit, cleared storage, schema drift).

import { getPreference, setPreference } from "../../storage/user-storage.js";

export function rememberLesson({ subjectId, subSubjectId, lessonId, title }) {
  if (!subjectId || !lessonId) return;
  try {
    setPreference("lastLesson", JSON.stringify({ subjectId, subSubjectId: subSubjectId ?? null, lessonId, title: title ?? "", at: Date.now() }));
  } catch {
    // Quota/private-mode: continuing-learning is a nicety, never a failure.
  }
}

export function getLastLesson() {
  try {
    const raw = getPreference("lastLesson", null);
    if (!raw) return null;
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!v || typeof v !== "object" || !v.subjectId || !v.lessonId) return null;
    return v;
  } catch {
    return null;
  }
}

export function clearLastLessonIfCompleted(lessonId) {
  const last = getLastLesson();
  if (last?.lessonId === lessonId) {
    try { setPreference("lastLesson", ""); } catch { /* ignore */ }
  }
}
