// src/components/bookmarks/bookmark-list.js
import { createEl } from "../../utils/dom.js";
import { createEmptyState } from "../common/empty-state.js";

export function createBookmarkList(bookmarks) {
  if (!bookmarks.length) return createEmptyState({ message: "No bookmarks yet." });
  return createEl("ul", { role: "list", class: "ou-stack" }, bookmarks.map((b) =>
    createEl("li", {}, [
      createEl("a", { href: `#/subjects/${b.subjectId}/${b.subSubjectId}/lessons/${b.lessonId}`, class: "ou-link" }, [b.lessonId]),
    ])
  ));
}
