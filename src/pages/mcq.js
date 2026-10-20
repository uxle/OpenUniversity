// src/pages/mcq.js
import { createEl, mount } from "../utils/dom.js";
import { getLessonMcq } from "../services/content-service.js";
import { createMcqContainer } from "../components/mcq/mcq-container.js";
import { recordMcqScore } from "../engines/progress-engine.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { createTranslationFallbackNotice } from "../components/lesson/language-switcher.js";
import { router } from "../core/router.js";
import { icon } from "../utils/icon.js";

export async function render(container, { subjectId, subSubjectId, lessonId }, nav = null) {
  const lang = new URLSearchParams(router.currentPath().split("?")[1] || "").get("lang") || "en";
  try {
    const { data, isFallback, lang: servedLang } = await getLessonMcq(subjectId, subSubjectId, lessonId, lang);
    if (nav?.stale) return;
    document.title = `${data.title || "Quiz"} — OpenKnowledge`;
    // The quiz previously rendered with no way back — the header/footer
    // hold no lesson link, so finishing (or abandoning) a quiz left you
    // re-typing the lesson URL. Reuses the lesson page's back-link style.
    const backHref = subSubjectId
      ? `#/subjects/${subjectId}/${subSubjectId}/lessons/${lessonId}`
      : `#/subjects/${subjectId}/lessons/${lessonId}`;
    mount(container, createEl("div", { class: "ou-container ou-stack" }, [
      createEl("a", { href: backHref, class: "ou-back-link" }, [
        icon("chevron-left"), `Back to ${data.title || "the lesson"}`,
      ]),
      isFallback ? createTranslationFallbackNotice(lang) : null,
      createMcqContainer(data, (correct, total) => {
        recordMcqScore(subjectId, subSubjectId, lessonId, correct, total);
      }),
    ]));
  } catch (err) {
    mount(container, createEmptyState({ message: `No quiz available for this lesson yet (${err.message}).` }));
  }
}
