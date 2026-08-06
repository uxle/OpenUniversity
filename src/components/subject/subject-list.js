// src/components/subject/subject-list.js
import { createEl } from "../../utils/dom.js";
import { createSubjectCard } from "./subject-card.js";
import { createEmptyState } from "../common/empty-state.js";

/**
 * @param {object[]} subjects
 * @param {{ failed?: boolean, onRetry?: Function }} [opts] - `failed` distinguishes
 *   "the registry failed to load" from "the registry loaded and is genuinely empty" —
 *   these need different messages, not the same generic blank state.
 */
export function createSubjectList(subjects, { failed = false, onRetry = null } = {}) {
  if (failed) {
    return createEmptyState({
      message: "Couldn't load subjects right now.",
      iconName: "triangle-exclamation",
      actionLabel: onRetry ? "Try again" : null,
      onAction: onRetry,
    });
  }
  if (!subjects.length) {
    return createEmptyState({
      message: "No subjects published yet.",
      iconName: "book",
      actionLabel: "See how to contribute one",
      onAction: () => { location.hash = "/contribute"; },
    });
  }
  return createEl("div", { class: "ou-grid" }, subjects.map(createSubjectCard));
}
