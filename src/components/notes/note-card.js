// src/components/notes/note-card.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { timeAgo } from "../../utils/dates.js";

export function createNoteCard(note, { onEdit, onDelete } = {}) {
  return createEl("div", { class: "ou-card" }, [
    createEl("p", {}, [note.text]),
    createEl("div", { class: "ou-cluster" }, [
      createEl("span", { class: "ou-text-sm" }, [timeAgo(new Date(note.updatedAt))]),
      onEdit ? createEl("button", { type: "button", class: "ou-btn ou-btn--ghost ou-btn--sm", "aria-label": "Edit note", on: { click: () => onEdit(note) } }, [icon("pen")]) : null,
      onDelete ? createEl("button", { type: "button", class: "ou-btn ou-btn--ghost ou-btn--sm", "aria-label": "Delete note", on: { click: () => onDelete(note) } }, [icon("trash")]) : null,
    ]),
  ]);
}
