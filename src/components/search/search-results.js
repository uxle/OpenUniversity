// src/components/search/search-results.js
import { createEl } from "../../utils/dom.js";
import { createEmptyState } from "../common/empty-state.js";
import { truncate } from "../../utils/text.js";

/** @param {{ title, subject, subSubject, lessonId, subjectId, subSubjectId, content }[]} results */
export function createSearchResults(results) {
  if (!results.length) return createEmptyState({ message: "No results yet — try a different search." });
  return createEl("div", { class: "ou-search-results" }, results.map((r) =>
    createEl("a", { href: `#/subjects/${r.subjectId}/${r.subSubjectId}/lessons/${r.lessonId}`, class: "ou-search-result" }, [
      createEl("div", { class: "ou-card__title" }, [r.title]),
      createEl("div", { class: "ou-text-sm" }, [truncate(r.content || "", 140)]),
    ])
  ));
}
