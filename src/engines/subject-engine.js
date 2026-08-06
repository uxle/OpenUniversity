// src/engines/subject-engine.js — subject/sub-subject lookups for the UI.

import { getSubjectRegistry, getSubSubjectIndex } from "../services/content-service.js";

export async function listSubjects() {
  const registry = await getSubjectRegistry();
  return registry.subjects || [];
}

export async function getSubject(subjectId) {
  const subjects = await listSubjects();
  return subjects.find((s) => s.id === subjectId) || null;
}

export async function getSubSubject(subjectId, subSubjectId) {
  const subject = await getSubject(subjectId);
  const subSubject = subject?.subSubjects?.find((s) => s.id === subSubjectId) || null;
  return subSubject;
}

export async function listLessons(subjectId, subSubjectId) {
  const index = await getSubSubjectIndex(subjectId, subSubjectId);
  return index.lessons || [];
}
