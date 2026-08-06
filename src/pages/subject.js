// src/pages/subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubject } from "../engines/subject-engine.js";
import { createSubjectHeader } from "../components/subject/subject-header.js";
import { createEmptyState } from "../components/common/empty-state.js";

export async function render(container, { subjectId }) {
  const subject = await getSubject(subjectId);
  if (!subject) {
    document.title = "Subject not found — OpenKnowledge";
    mount(container, createEmptyState({ message: `Subject "${subjectId}" not found.`, iconName: "circle-question" }));
    return;
  }
  document.title = `${subject.title} — OpenKnowledge`;
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createSubjectHeader(subject),
    createEl("div", { class: "ou-grid" }, (subject.subSubjects || []).map((s) =>
      createEl("a", { href: `#/subjects/${subjectId}/${s.id}`, class: "ou-card ou-card--interactive" }, [
        createEl("div", { class: "ou-card__title" }, [s.title]),
      ])
    )),
  ]));
}
