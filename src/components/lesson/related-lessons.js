// src/components/lesson/related-lessons.js
import { createEl } from "../../utils/dom.js";
import { getRelatedLessons } from "../../engines/recommendation-engine.js";
import { resolveLessonTitles } from "../../services/lesson-title-service.js";

export async function createRelatedLessons(subjectId, subSubjectId, currentLessonId) {
  const relatedIds = await getRelatedLessons(subjectId, subSubjectId, currentLessonId);
  if (!relatedIds.length) return createEl("div");
  // Titles come from the shared search index (one cached fetch) instead of
  // fetching every related lesson's full source just to read its heading.
  const related = await resolveLessonTitles(subjectId, subSubjectId, relatedIds);
  return createEl("div", { class: "ou-stack" }, [
    createEl("h3", {}, ["Related lessons"]),
    createEl("ul", { role: "list" }, related.map(({ id, title }) => {
      const href = subSubjectId
        ? `#/subjects/${subjectId}/${subSubjectId}/lessons/${id}`
        : `#/subjects/${subjectId}/lessons/${id}`;
      return createEl("li", {}, [
        createEl("a", { href, class: "ou-link" }, [title]),
      ]);
    })),
  ]);
}
