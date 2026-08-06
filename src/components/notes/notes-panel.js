// src/components/notes/notes-panel.js — composes editor + list for a lesson.
import { createEl, empty } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { listNotesForLesson } from "../../engines/notes-engine.js";
import { createNoteEditor } from "./note-editor.js";
import { createNoteList } from "./note-list.js";

export async function createNotesPanel(subjectId, subSubjectId, lessonId) {
  const listContainer = createEl("div");

  async function refresh() {
    const notes = await listNotesForLesson(subjectId, subSubjectId, lessonId);
    empty(listContainer);
    listContainer.appendChild(createNoteList(notes, { onChange: refresh }));
  }

  const editor = createNoteEditor({ subjectId, subSubjectId, lessonId, onSaved: refresh });
  await refresh();

  return createEl("div", { class: "ou-stack" }, [
    createEl("h3", { class: "ou-cluster" }, [icon("note-sticky"), "Notes"]),
    editor,
    listContainer,
  ]);
}
