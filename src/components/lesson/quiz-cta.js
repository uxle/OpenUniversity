// src/components/lesson/quiz-cta.js — "Take the Quiz" entry point on the
// lesson page. Nothing in the app linked to the MCQ route (src/pages/mcq.js)
// before this; the route and quiz UI worked fine, there was just no
// discoverable way to reach it from a lesson.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { getLessonMcq } from "../../services/content-service.js";

/**
 * Resolves to a card linking to this lesson's quiz, or `null` if the
 * lesson has no *mcq.json — most lessons don't yet, so the caller can
 * simply append whatever this returns without checking first (append(null)
 * is a no-op via createEl's existing null-child handling).
 * @param {string} subjectId
 * @param {string} subSubjectId
 * @param {string} lessonId
 * @param {{ score?: number, attempts?: number } | null} [progress] - reuse
 *   the same getLessonProgress() call the lesson page already makes,
 *   rather than a second fetch, to show a prior score if there is one.
 */
export async function createQuizCta(subjectId, subSubjectId, lessonId, progress = null) {
  let data;
  try {
    ({ data } = await getLessonMcq(subjectId, subSubjectId, lessonId));
  } catch {
    return null; // no quiz for this lesson — not an error, just nothing to show
  }
  const count = data?.questions?.length ?? 0;
  if (!count) return null;

  const attempted = typeof progress?.score === "number" && progress.score !== null;
  const href = `#/subjects/${subjectId}/${subSubjectId}/mcq/${lessonId}`;

  return createEl("a", { href, class: "ou-card ou-card--interactive ou-quiz-cta" }, [
    createEl("div", { class: "ou-quiz-cta__icon" }, [icon("circle-question")]),
    createEl("div", { class: "ou-quiz-cta__body" }, [
      createEl("div", { class: "ou-card__title" }, [attempted ? "Retake the quiz" : "Take the quiz"]),
      createEl("div", { class: "ou-text-sm ou-text-secondary" }, [
        attempted
          ? `${count} ${count === 1 ? "question" : "questions"} · last score ${Math.round(progress.score * 100)}%`
          : `${count} ${count === 1 ? "question" : "questions"} · test what you just learned`,
      ]),
    ]),
    icon("chevron-right", { class: "ou-quiz-cta__chevron" }),
  ]);
}
