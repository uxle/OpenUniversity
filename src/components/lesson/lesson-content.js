// src/components/lesson/lesson-content.js — mounts Zolto's compiled HTML.
// Zolto's compile() output is already sanitized HTML (per its docs); we
// still isolate it in its own container so zolto-content.css can scope
// styling to compiled output specifically.
import { createEl } from "../../utils/dom.js";

export function createLessonContent(html) {
  const container = createEl("div", { class: "ou-lesson-content" });
  container.innerHTML = html;
  return container;
}
