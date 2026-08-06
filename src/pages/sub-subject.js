// src/pages/sub-subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubSubject, listLessons } from "../engines/subject-engine.js";
import { createEmptyState } from "../components/common/empty-state.js";

export async function render(container, { subjectId, subSubjectId }) {
  const [subSubject, lessons] = await Promise.all([
    getSubSubject(subjectId, subSubjectId),
    listLessons(subjectId, subSubjectId).catch(() => []),
  ]);
  if (!subSubject) {
    document.title = "Not found — OpenKnowledge";
    mount(container, createEmptyState({ message: `"${subSubjectId}" not found.`, iconName: "circle-question" }));
    return;
  }
  document.title = `${subSubject.title} — OpenKnowledge`;
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, [subSubject.title]),
    createEl("p", { class: "ou-text-secondary" }, [subSubject.description || ""]),
    createEl("ul", { role: "list", class: "ou-stack" }, lessons.map((lessonId) =>
      createEl("li", {}, [
        createEl("a", { href: `#/subjects/${subjectId}/${subSubjectId}/lessons/${lessonId}`, class: "ou-card ou-card--interactive" }, [lessonId]),
      ])
    )),
  ]));
}
