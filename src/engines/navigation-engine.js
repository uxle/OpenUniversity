// src/engines/navigation-engine.js — breadcrumbs + prev/next lesson.

import { getSubject, getSubSubject, listLessons } from "./subject-engine.js";

export async function buildBreadcrumb(subjectId, subSubjectId, lessonId) {
  const trail = [{ label: "Home", path: "/" }, { label: "Subjects", path: "/subjects" }];
  const subject = await getSubject(subjectId);
  if (subject) trail.push({ label: subject.title, path: `/subjects/${subjectId}` });
  if (subSubjectId) {
    const subSubject = await getSubSubject(subjectId, subSubjectId);
    if (subSubject) trail.push({ label: subSubject.title, path: `/subjects/${subjectId}/${subSubjectId}` });
  }
  if (lessonId) {
    trail.push({ label: lessonId, path: `/subjects/${subjectId}/${subSubjectId}/lessons/${lessonId}` });
  }
  return trail;
}

export async function getAdjacentLessons(subjectId, subSubjectId, lessonId) {
  const lessons = await listLessons(subjectId, subSubjectId);
  const index = lessons.indexOf(lessonId);
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}
