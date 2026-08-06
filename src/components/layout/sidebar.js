// src/components/layout/sidebar.js — currently unused. The app shell was
// simplified to a header + bottom-nav pattern with no persistent sidebar
// (see layout.css for why — a real mobile bug report traced back to the
// old sidebar/grid layout). Left here, still functional, in case a
// desktop-specific sidebar is wanted again later.
import { createEl } from "../../utils/dom.js";
import { listSubjects } from "../../engines/subject-engine.js";

export async function createSidebar() {
  const subjects = await listSubjects().catch(() => []);
  return createEl("aside", { class: "ou-sidebar", "aria-label": "Subjects" }, [
    createEl("div", { class: "ou-sidebar__section" }, [
      createEl("div", { class: "ou-sidebar__heading" }, ["Subjects"]),
      ...subjects.map((s) => createEl("a", { href: `#/subjects/${s.id}`, class: "ou-sidebar__item" }, [s.title])),
    ]),
  ]);
}
