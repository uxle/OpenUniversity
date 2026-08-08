// src/components/lesson/related-lessons.js
import { createEl } from "../../utils/dom.js";
import { getRelatedLessons } from "../../engines/recommendation-engine.js";
import { getLessonSource } from "../../services/content-service.js";

/** Mirrors sub-subject.js's titleFromZl() — see that file for why this is
 *  needed rather than just displaying the raw lesson id. */
function titleFromZl(source, fallback) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

export async function createRelatedLessons(subjectId, subSubjectId, currentLessonId) {
  const relatedIds = await getRelatedLessons(subjectId, subSubjectId, currentLessonId);
  if (!relatedIds.length) return createEl("div");
  const related = await Promise.all(relatedIds.map(async (id) => {
    try {
      const { source } = await getLessonSource(subjectId, subSubjectId, id);
      return { id, title: titleFromZl(source, id) };
    } catch {
      return { id, title: id };
    }
  }));
  return createEl("div", { class: "ou-stack" }, [
    createEl("h3", {}, ["Related lessons"]),
    createEl("ul", { role: "list" }, related.map(({ id, title }) =>
      createEl("li", {}, [
        createEl("a", { href: `#/subjects/${subjectId}/${subSubjectId}/lessons/${id}`, class: "ou-link" }, [title]),
      ])
    )),
  ]);
}
