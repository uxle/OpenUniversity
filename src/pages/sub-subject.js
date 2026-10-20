// src/pages/sub-subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubSubject, listLessons } from "../engines/subject-engine.js";
import { resolveLessonTitles } from "../services/lesson-title-service.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { addHoverPrefetch, prefetchLesson, prefetchRegistry } from "../utils/prefetch.js";
import { config } from "../app/config.js";

export async function render(container, { subjectId, subSubjectId }, nav = null) {
  const [subSubject, lessonIds] = await Promise.all([
    getSubSubject(subjectId, subSubjectId),
    listLessons(subjectId, subSubjectId).catch(() => []),
  ]);
  if (nav?.stale) return;
  if (!subSubject) {
    document.title = "Not found — OpenKnowledge";
    mount(container, createEmptyState({ message: `"${subSubjectId}" not found.`, iconName: "circle-question" }));
    return;
  }
  document.title = `${subSubject.title} — OpenKnowledge`;
  const lessons = await resolveLessonTitles(subjectId, subSubjectId, lessonIds);
  if (nav?.stale) return;

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, [subSubject.title]),
    createEl("p", { class: "ou-text-secondary" }, [subSubject.description || ""]),
    createEl("ul", { role: "list", class: "ou-stack" }, lessons.map(({ id, title }) => {
      const el = createEl("a", {
        href: `#/subjects/${subjectId}/${subSubjectId}/lessons/${id}`,
        class: "ou-card ou-card--interactive",
      }, [title]);
      // Warm the lesson module + source file on hover so navigation is instant.
      const base = `${config.dataBasePath}/${subjectId}/${subSubjectId}`;
      addHoverPrefetch(el, () => {
        prefetchRegistry(config.registryPath);
        prefetchLesson(`${base}/lessons/${id}.zl`);
      });
      return createEl("li", {}, [el]);
    })),
  ]));
}
