// src/components/subject/subject-header.js
import { createEl } from "../../utils/dom.js";

export function createSubjectHeader(subject) {
  return createEl("div", { class: "ou-stack" }, [
    createEl("h1", {}, [subject.title]),
    subject.description ? createEl("p", { class: "ou-text-secondary" }, [subject.description]) : null,
  ]);
}
