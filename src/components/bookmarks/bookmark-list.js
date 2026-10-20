// src/components/bookmarks/bookmark-list.js
import { createEl } from "../../utils/dom.js";
import { createEmptyState } from "../common/empty-state.js";

export function createBookmarkList(bookmarks) {
  if (!bookmarks.length) return createEmptyState({ message: "No bookmarks yet." });
  return createEl("ul", { role: "list", class: "ou-stack" }, bookmarks.map((b) => {
    // Flat subjects (economics, history…) have no sub-subject segment in
    // their routes — interpolating it blindly produced
    // "#/subjects/<id>/undefined/lessons/<id>" links that 404'd.
    const href = b.subSubjectId
      ? `#/subjects/${b.subjectId}/${b.subSubjectId}/lessons/${b.lessonId}`
      : `#/subjects/${b.subjectId}/lessons/${b.lessonId}`;
    return createEl("li", {}, [
      createEl("a", { href, class: "ou-link" }, [b.lessonId]),
    ]);
  }));
}
