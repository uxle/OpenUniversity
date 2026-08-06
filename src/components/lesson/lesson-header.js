// src/components/lesson/lesson-header.js — subject badge + title,
// matching the reference reader design.
import { createEl } from "../../utils/dom.js";

export function createLessonHeader(lesson, subjectTitle) {
  return createEl("div", { class: "ou-lesson__meta" }, [
    subjectTitle ? createEl("span", { class: "ou-lesson-badge" }, [subjectTitle]) : null,
    createEl("h1", { class: "ou-reader-title" }, [lesson.title]),
  ]);
}
