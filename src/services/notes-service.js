// src/services/notes-service.js — thin business layer over notes-storage.

import {
  getAllNotes, getNotesForLesson, createNote, updateNote, deleteNote,
} from "../storage/notes-storage.js";
import { sanitizeText } from "../utils/sanitize.js";
import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../app/constants.js";

export async function listNotesForLesson(subjectId, subSubjectId, lessonId) {
  const all = await getAllNotes();
  return getNotesForLesson(all, subjectId, subSubjectId, lessonId);
}

export async function saveNote({ subjectId, subSubjectId, lessonId, text, existing = null }) {
  const clean = sanitizeText(text, { maxLength: 10000 });
  const record = existing
    ? await updateNote(existing.id, clean, existing)
    : await createNote({ subjectId, subSubjectId, lessonId, text: clean });
  eventBus.emit(EVENTS.NOTE_SAVED, record);
  return record;
}

export async function removeNote(id) {
  return deleteNote(id);
}
