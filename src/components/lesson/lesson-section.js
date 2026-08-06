// src/components/lesson/lesson-section.js — generic titled section wrapper,
// used by pages composing multiple lesson sub-blocks (content, glossary, etc).
import { createEl } from "../../utils/dom.js";

export function createLessonSection(title, content) {
  return createEl("section", { class: "ou-stack" }, [
    title ? createEl("h2", {}, [title]) : null,
    content,
  ]);
}
