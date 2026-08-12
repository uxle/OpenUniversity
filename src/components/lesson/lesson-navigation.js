// src/components/lesson/lesson-navigation.js
import { createEl } from "../../utils/dom.js";
import { getAdjacentLessons } from "../../engines/navigation-engine.js";

export async function createLessonNavigation(subjectId, subSubjectId, lessonId) {
  const { previous, next } = await getAdjacentLessons(subjectId, subSubjectId, lessonId);
  // Flat subjects (no subSubjectId — see app/constants.js's ROUTES comment)
  // link through SUBJECT_LESSON instead of LESSON, omitting that segment.
  const base = subSubjectId
    ? `#/subjects/${subjectId}/${subSubjectId}/lessons`
    : `#/subjects/${subjectId}/lessons`;

  function link(id, label) {
    if (!id) return createEl("span");
    return createEl("a", { href: `${base}/${id}`, class: "ou-lesson-nav__link" }, [
      createEl("span", { class: "ou-lesson-nav__label" }, [label]),
      createEl("span", { class: "ou-lesson-nav__title" }, [id]),
    ]);
  }

  return createEl("nav", { class: "ou-lesson-nav", "aria-label": "Lesson navigation" }, [
    link(previous, "← Previous"),
    link(next, "Next →"),
  ]);
}
