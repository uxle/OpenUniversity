// src/pages/notes.js — all notes across lessons (not scoped to one lesson).
import { createEl, mount } from "../utils/dom.js";
import { getAllNotes } from "../storage/notes-storage.js";
import { createNoteList } from "../components/notes/note-list.js";

export async function render(container) {
  document.title = "Notes — OpenKnowledge";
  const notes = await getAllNotes().catch(() => []);
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Notes"]),
    createNoteList(notes),
  ]));
}
