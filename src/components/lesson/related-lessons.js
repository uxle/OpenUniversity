// src/components/lesson/related-lessons.js
import { createEl } from "../../utils/dom.js";
import { getRelatedLessons } from "../../engines/recommendation-engine.js";

export async function createRelatedLessons(subjectId, subSubjectId, currentLessonId) {
  const related = await getRelatedLessons(subjectId, subSubjectId, currentLessonId);
  if (!related.length) return createEl("div");
  return createEl("div", { class: "ou-stack" }, [
    createEl("h3", {}, ["Related lessons"]),
    createEl("ul", { role: "list" }, related.map((id) =>
      createEl("li", {}, [
        createEl("a", { href: `#/subjects/${subjectId}/${subSubjectId}/lessons/${id}`, class: "ou-link" }, [id]),
      ])
    )),
  ]);
}
