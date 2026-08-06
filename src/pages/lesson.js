// src/pages/lesson.js — composes the full lesson reading experience:
// translation, progress, bookmarking, PDF export, prev/next, related, notes.
import { createEl, mount, empty } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { loadLesson } from "../engines/lesson-engine.js";
import { getLessonProgress } from "../engines/progress-engine.js";
import { getSubject, getSubSubject } from "../engines/subject-engine.js";
import { createLessonHeader } from "../components/lesson/lesson-header.js";
import { createLessonContent } from "../components/lesson/lesson-content.js";
import { createLessonProgressControl } from "../components/lesson/lesson-progress.js";
import { createLessonNavigation } from "../components/lesson/lesson-navigation.js";
import { createRelatedLessons } from "../components/lesson/related-lessons.js";
import { createBookmarkButton } from "../components/bookmarks/bookmark-button.js";
import { createNotesPanel } from "../components/notes/notes-panel.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { createExportPdfButton } from "../components/lesson/export-pdf-button.js";
import { createLanguageSwitcher, createTranslationFallbackNotice } from "../components/lesson/language-switcher.js";
import { router } from "../core/router.js";

export async function render(container, { subjectId, subSubjectId, lessonId }) {
  const contentSlot = createEl("div", { class: "ou-stack" });
  const requestedLang = new URLSearchParams(router.currentPath().split("?")[1] || "").get("lang") || "en";

  async function renderLanguage(lang) {
    empty(contentSlot);
    contentSlot.appendChild(createEl("p", { class: "ou-text-secondary" }, ["Loading…"]));
    try {
      const [lesson, progress, subject, subSubject, nav, related, notes] = await Promise.all([
        loadLesson(subjectId, subSubjectId, lessonId, lang),
        getLessonProgress(subjectId, subSubjectId, lessonId).catch(() => null),
        getSubject(subjectId).catch(() => null),
        getSubSubject(subjectId, subSubjectId).catch(() => null),
        createLessonNavigation(subjectId, subSubjectId, lessonId),
        createRelatedLessons(subjectId, subSubjectId, lessonId),
        createNotesPanel(subjectId, subSubjectId, lessonId),
      ]);

      empty(contentSlot);
      document.title = `${lesson.title} — OpenKnowledge`;
      contentSlot.append(
        createEl("div", { class: "ou-reader-top-controls" }, [
          createEl("a", { href: `#/subjects/${subjectId}/${subSubjectId}`, class: "ou-back-link" }, [
            icon("chevron-left"), `Back to ${subSubject?.title || "lessons"}`,
          ]),
          createEl("div", { class: "ou-cluster" }, [
            createLanguageSwitcher(lang, renderLanguage),
            createExportPdfButton(),
          ]),
        ]),
        createEl("div", { class: "ou-reader-card" }, [
          createLessonHeader(lesson, subject?.title),
          createEl("div", { class: "ou-cluster ou-reader-meta-row" }, [
            createLessonProgressControl(subjectId, subSubjectId, lessonId, { completed: progress?.completed }),
            createBookmarkButton(subjectId, subSubjectId, lessonId),
          ]),
          lesson.isFallback ? createTranslationFallbackNotice(lesson.requestedLang) : null,
          createLessonContent(lesson.html),
        ]),
        nav,
        related,
        notes,
      );
    } catch (err) {
      empty(contentSlot);
      contentSlot.appendChild(createEmptyState({ message: `Couldn't load this lesson (${err.message}).`, iconName: "triangle-exclamation" }));
    }
  }

  mount(container, createEl("div", { class: "ou-lesson" }, [contentSlot]));
  await renderLanguage(requestedLang);
}
