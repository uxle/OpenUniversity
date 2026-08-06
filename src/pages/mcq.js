// src/pages/mcq.js
import { createEl, mount } from "../utils/dom.js";
import { getLessonMcq } from "../services/content-service.js";
import { createMcqContainer } from "../components/mcq/mcq-container.js";
import { recordMcqScore } from "../engines/progress-engine.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { createTranslationFallbackNotice } from "../components/lesson/language-switcher.js";
import { router } from "../core/router.js";

export async function render(container, { subjectId, subSubjectId, lessonId }) {
  const lang = new URLSearchParams(router.currentPath().split("?")[1] || "").get("lang") || "en";
  try {
    const { data, isFallback, lang: servedLang } = await getLessonMcq(subjectId, subSubjectId, lessonId, lang);
    document.title = `${data.title || "Quiz"} — OpenKnowledge`;
    mount(container, createEl("div", { class: "ou-container ou-stack" }, [
      isFallback ? createTranslationFallbackNotice(lang) : null,
      createMcqContainer(data, (correct, total) => {
        recordMcqScore(subjectId, subSubjectId, lessonId, correct, total);
      }),
    ]));
  } catch (err) {
    mount(container, createEmptyState({ message: `No quiz available for this lesson yet (${err.message}).` }));
  }
}
