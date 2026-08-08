// src/pages/sub-subject.js
import { createEl, mount } from "../utils/dom.js";
import { getSubSubject, listLessons } from "../engines/subject-engine.js";
import { getLessonSource } from "../services/content-service.js";
import { createEmptyState } from "../components/common/empty-state.js";

/** Same "# Heading" extraction tools/generate-registry.js uses for subject/
 *  sub-subject titles — lessons need the same treatment, since the listing
 *  below previously showed the raw lessonId ("cell-biology") instead of a
 *  real title ("Cell Biology") for every lesson with no separate title
 *  metadata anywhere to draw on. */
function titleFromZl(source, fallback) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

export async function render(container, { subjectId, subSubjectId }) {
  const [subSubject, lessonIds] = await Promise.all([
    getSubSubject(subjectId, subSubjectId),
    listLessons(subjectId, subSubjectId).catch(() => []),
  ]);
  if (!subSubject) {
    document.title = "Not found — OpenKnowledge";
    mount(container, createEmptyState({ message: `"${subSubjectId}" not found.`, iconName: "circle-question" }));
    return;
  }
  document.title = `${subSubject.title} — OpenKnowledge`;
  const lessons = await Promise.all(lessonIds.map(async (lessonId) => {
    try {
      const { source } = await getLessonSource(subjectId, subSubjectId, lessonId);
      return { id: lessonId, title: titleFromZl(source, lessonId) };
    } catch {
      return { id: lessonId, title: lessonId }; // unreadable — show the id rather than break the list
    }
  }));
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, [subSubject.title]),
    createEl("p", { class: "ou-text-secondary" }, [subSubject.description || ""]),
    createEl("ul", { role: "list", class: "ou-stack" }, lessons.map(({ id, title }) =>
      createEl("li", {}, [
        createEl("a", { href: `#/subjects/${subjectId}/${subSubjectId}/lessons/${id}`, class: "ou-card ou-card--interactive" }, [title]),
      ])
    )),
  ]));
}
