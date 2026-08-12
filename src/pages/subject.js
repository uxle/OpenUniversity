// src/pages/subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubject, listLessons } from "../engines/subject-engine.js";
import { getLessonSource } from "../services/content-service.js";
import { createSubjectHeader } from "../components/subject/subject-header.js";
import { createEmptyState } from "../components/common/empty-state.js";

/** Mirrors sub-subject.js's titleFromZl() — same reasoning applies here
 *  for "flat" subjects (no subSubjects) that list their own lessons
 *  directly on this page instead of sub-subject cards. */
function titleFromZl(source, fallback) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

export async function render(container, { subjectId }) {
  const subject = await getSubject(subjectId);
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
      createEl("div", { class: "ou-grid" }, subject.subSubjects.map((s) =>
        createEl("a", { href: `#/subjects/${subjectId}/${s.id}`, class: "ou-card ou-card--interactive" }, [
          createEl("div", { class: "ou-card__title" }, [s.title]),
        ])
      )),
    ]));
    return;
  }

  // "Flat" subject — no subSubjects, lessons sit directly under it (see
  // src/subjects/*/index.json + details.zl for reasoning, economics,
  // geography, history). Without this branch there was previously no way
  // to reach these lessons from the UI at all — subSubjects.map() above
  // just rendered an empty grid. List the lessons inline instead, the
  // same way sub-subject.js does for a real sub-subject.
  const lessonIds = await listLessons(subjectId, undefined).catch(() => []);
  const lessons = await Promise.all(lessonIds.map(async (lessonId) => {
    try {
      const { source } = await getLessonSource(subjectId, undefined, lessonId);
      return { id: lessonId, title: titleFromZl(source, lessonId) };
    } catch {
      return { id: lessonId, title: lessonId };
    }
  }));

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createSubjectHeader(subject),
    lessons.length
      ? createEl("ul", { role: "list", class: "ou-stack" }, lessons.map(({ id, title }) =>
          createEl("li", {}, [
            createEl("a", { href: `#/subjects/${subjectId}/lessons/${id}`, class: "ou-card ou-card--interactive" }, [title]),
          ])
        ))
      : createEmptyState({ message: "No lessons here yet.", iconName: "circle-question" }),
  ]));
}
