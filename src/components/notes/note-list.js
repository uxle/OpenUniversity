// src/components/notes/note-list.js
import { createEl } from "../../utils/dom.js";
import { createNoteCard } from "./note-card.js";
import { createEmptyState } from "../common/empty-state.js";
import { confirmDialog } from "../common/dialog.js";
import { removeNote } from "../../engines/notes-engine.js";

export function createNoteList(notes, { onEdit, onChange, emptyMessage = "No notes for this lesson yet.", emptyAction = null } = {}) {
  if (!notes.length) return createEmptyState({ message: emptyMessage, iconName: "note-sticky", ...(emptyAction || {}) });
  return createEl("div", { class: "ou-stack" }, notes.map((note) =>
    createNoteCard(note, {
      onEdit,
      onDelete: async (n) => {
        const confirmed = await confirmDialog({
          title: "Delete this note?",
          message: "This can't be undone.",
          confirmLabel: "Delete",
        });
        if (!confirmed) return;
        await removeNote(n.id);
        onChange?.();
      },
    })
  ));
}
