// src/components/notes/note-editor.js
import { createEl } from "../../utils/dom.js";
import { saveNote } from "../../engines/notes-engine.js";
import { showToast } from "../common/toast.js";

export function createNoteEditor({ subjectId, subSubjectId, lessonId, existing = null, onSaved }) {
  const textarea = createEl("textarea", {
    rows: 4, class: "ou-note-editor__textarea", placeholder: "Write a note about this lesson…",
    name: "note",
  });
  textarea.value = existing?.text || "";
  let dirty = false;
  textarea.addEventListener("input", () => { dirty = true; });

  async function submit() {
    const record = await saveNote({ subjectId, subSubjectId, lessonId, text: textarea.value.trim(), existing });
    dirty = false;
    showToast("Note saved", "success");
    onSaved?.(record);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submit();
  }

  // AGENTS.txt: in a <textarea>, ⌘/Ctrl+Enter submits.
  textarea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  });

  // Warn before navigating away with an unsaved note (only while this
  // editor is on the page — listener is removed once the lesson unmounts
  // isn't tracked here since there's no unmount hook yet, so this is a
  // best-effort per-editor-instance guard for the common case: leaving
  // the tab/window mid-edit).
  const beforeUnload = (e) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = "";
  };
  window.addEventListener("beforeunload", beforeUnload);

  return createEl("form", { class: "ou-stack", on: { submit: handleSubmit } }, [
    textarea,
    createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Save note"]),
  ]);
}
