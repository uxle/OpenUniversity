// src/storage/notes-storage.js — private per-lesson notes.
// Record shape: { id, lessonId, subjectId, subSubjectId, text, createdAt, updatedAt }

import { getAll, put, remove } from "./indexed-db.js";
import { uid } from "../utils/ids.js";

export async function getAllNotes() {
  return getAll("notes");
}

export async function getNotesForLesson(allNotes, subjectId, subSubjectId, lessonId) {
  return allNotes.filter((n) => n.subjectId === subjectId && n.subSubjectId === subSubjectId && n.lessonId === lessonId);
}

export async function createNote({ subjectId, subSubjectId, lessonId, text }) {
  const now = new Date().toISOString();
  const record = { id: uid("note"), subjectId, subSubjectId, lessonId, text, createdAt: now, updatedAt: now };
  await put("notes", record);
  return record;
}

export async function updateNote(id, text, existing) {
  const record = { ...existing, id, text, updatedAt: new Date().toISOString() };
  await put("notes", record);
  return record;
}

export async function deleteNote(id) {
  return remove("notes", id);
}
