// src/pages/subjects.js
import { createEl, mount } from "../utils/dom.js";
import { listSubjects } from "../engines/subject-engine.js";
import { createSubjectList } from "../components/subject/subject-list.js";

export async function render(container) {
  document.title = "Subjects — OpenKnowledge";
  let subjects = [];
  let failed = false;
  try {
    subjects = await listSubjects();
  } catch {
    failed = true;
  }
  mount(container, createEl("div", { class: "ou-stack" }, [
    createEl("h1", { class: "ou-hero-heading" }, ["All Subjects"]),
    createEl("p", { class: "ou-hero-subtext" }, ["A clean, structured knowledge catalog."]),
    createSubjectList(subjects, { failed, onRetry: () => render(container) }),
  ]));
}
