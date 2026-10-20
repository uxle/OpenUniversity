// src/pages/subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubject, listLessons } from "../engines/subject-engine.js";
import { resolveLessonTitles } from "../services/lesson-title-service.js";
import { createSubjectHeader } from "../components/subject/subject-header.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { addHoverPrefetch, prefetchLesson, prefetchRegistry } from "../utils/prefetch.js";
import { config } from "../app/config.js";

/**
 * Wire hover-prefetch onto a lesson link anchor element.
 * The .zl URL must match exactly what content-service.js builds so the
 * loader's cache recognises the warm entry on the real fetch.
 */
function withLessonPrefetch(el, subjectId, subSubjectId, lessonId) {
  const base = subSubjectId
    ? `${config.dataBasePath}/${subjectId}/${subSubjectId}`
    : `${config.dataBasePath}/${subjectId}`;
  const sourceUrl = `${base}/lessons/${lessonId}.zl`;
  addHoverPrefetch(el, () => {
    prefetchRegistry(config.registryPath);
    prefetchLesson(sourceUrl);
  });
  return el;
}

export async function render(container, { subjectId }, nav = null) {
  const subject = await getSubject(subjectId);
  if (nav?.stale) return;
  if (!subject) {
    document.title = "Subject not found — OpenKnowledge";
    mount(container, createEmptyState({ message: `Subject "${subjectId}" not found.`, iconName: "circle-question" }));
    return;
  }
  document.title = `${subject.title} — OpenKnowledge`;

  const hasSubSubjects = (subject.subSubjects || []).length > 0;

  if (hasSubSubjects) {
    mount(container, createEl("div", { class: "ou-container ou-stack" }, [
      createSubjectHeader(subject),
      createEl("div", { class: "ou-grid" }, subject.subSubjects.map((s) => {
        const el = createEl("a", { href: `#/subjects/${subjectId}/${s.id}`, class: "ou-card ou-card--interactive" }, [
          createEl("div", { class: "ou-card__title" }, [s.title]),
        ]);
        // Prefetch the lesson-list module on hover so the sub-subject page is instant.
        addHoverPrefetch(el, () => import("./sub-subject.js").catch(() => {}));
        return el;
      })),
    ]));
    return;
  }

  // "Flat" subject — no subSubjects, lessons sit directly under it.
  const lessonIds = await listLessons(subjectId, undefined).catch(() => []);
  const lessons = await resolveLessonTitles(subjectId, undefined, lessonIds);
  if (nav?.stale) return;

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createSubjectHeader(subject),
    lessons.length
      ? createEl("ul", { role: "list", class: "ou-stack" }, lessons.map(({ id, title }) => {
          const el = createEl("a", {
            href: `#/subjects/${subjectId}/lessons/${id}`,
            class: "ou-card ou-card--interactive",
          }, [title]);
          withLessonPrefetch(el, subjectId, undefined, id);
          return createEl("li", {}, [el]);
        }))
      : createEmptyState({ message: "No lessons here yet.", iconName: "circle-question" }),
  ]));
}
