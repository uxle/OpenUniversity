// src/pages/lesson.js — composes the full lesson reading experience:
// translation, progress, bookmarking, PDF export, prev/next, related, notes.
//
// PERFORMANCE ARCHITECTURE (two-phase render):
//
//   Phase A (critical path — renders reader card immediately):
//     loadLesson + getLessonProgress + getSubject/SubSubject + createQuizCta
//     → mount reader-card skeleton → replace with real content
//
//   Phase B (deferred — below the fold, does not block Phase A):
//     createLessonNavigation + createRelatedLessons + createNotesPanel
//     → appended after Phase A paint via queueMicrotask/setTimeout
//
// This means the user sees the lesson title, badge and body text within one
// render cycle of Phase A completing (typically <100 ms on a warm cache,
// one fetch round-trip on cold). Notes/nav/related fill in silently below.

import { createEl, mount, empty } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { loadLesson } from "../engines/lesson-engine.js";
import { getLessonProgress } from "../engines/progress-engine.js";
import { getSubject } from "../engines/subject-engine.js";
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
import { createQuizCta } from "../components/lesson/quiz-cta.js";
import { createReadingProgress } from "../components/lesson/reading-progress.js";
import { rememberLesson } from "../components/lesson/last-lesson.js";
import { router } from "../core/router.js";

// ─── Skeleton ────────────────────────────────────────────────────────────────
// Mirrors the real reader-card layout so there's zero layout shift when
// content arrives. Shown immediately on navigation, replaced by real content.

function createLessonSkeleton() {
  const skLine = (w = "100%") =>
    createEl("div", { class: "ou-skeleton ou-skeleton--text", style: `width:${w}` });

  return createEl("div", { class: "ou-lesson" }, [
    // Top controls row
    createEl("div", { class: "ou-reader-top-controls" }, [
      createEl("div", { class: "ou-skeleton ou-skeleton--text", style: "width:120px" }),
    ]),
    // Reader card
    createEl("div", { class: "ou-reader-card" }, [
      // Badge
      createEl("div", { class: "ou-skeleton ou-skeleton--text", style: "width:80px;height:22px;margin-bottom:12px;border-radius:9999px" }),
      // Title
      createEl("div", { class: "ou-skeleton ou-skeleton--heading" }),
      // Meta row
      createEl("div", { class: "ou-skeleton ou-skeleton--text", style: "width:160px;margin-bottom:24px" }),
      // Content lines
      skLine("100%"), skLine("95%"), skLine("88%"), skLine("100%"), skLine("72%"),
      createEl("div", { style: "height:16px" }),
      skLine("100%"), skLine("91%"), skLine("84%"), skLine("100%"), skLine("60%"),
      createEl("div", { style: "height:16px" }),
      skLine("100%"), skLine("96%"), skLine("78%"),
    ]),
  ]);
}

// ─── Deferred secondary content slot ─────────────────────────────────────────
// A placeholder that is appended immediately (below the fold) and filled in
// by Phase B without blocking the Phase A paint.

function createSecondarySlot() {
  return createEl("div", { class: "ou-lesson-secondary", "aria-live": "polite" });
}

// ─── Main render ─────────────────────────────────────────────────────────────

export async function render(container, { subjectId, subSubjectId, lessonId }, nav = null) {
  const requestedLang = new URLSearchParams(router.currentPath().split("?")[1] || "").get("lang") || "en";

  // Reusable content slot — swapped between skeleton and real content.
  const contentSlot = createEl("div", { class: "ou-stack" });
  // Secondary slot for below-the-fold content (nav, related, notes).
  const secondarySlot = createSecondarySlot();

  // Show skeleton immediately — user sees structure within one frame.
  contentSlot.appendChild(createLessonSkeleton());
  mount(container, createEl("div", {}, [contentSlot, secondarySlot]));

  async function renderLanguage(lang) {
    if (nav?.stale) return;

    // ── Phase A: critical path ──────────────────────────────────────────────
    // Replace skeleton with a fresh one for language switches too.
    empty(contentSlot);
    contentSlot.appendChild(createLessonSkeleton());
    empty(secondarySlot);

    let lesson, progress, subject, quizCta;
    try {
      // FIX 2: quizCta runs in parallel with lesson fetch — not sequential.
      // FIX 3: derive subSubject from the single getSubject() call, avoiding
      //        a second async chain through the same registry.
      [lesson, progress, subject, quizCta] = await Promise.all([
        loadLesson(subjectId, subSubjectId, lessonId, lang),
        getLessonProgress(subjectId, subSubjectId, lessonId).catch(() => null),
        getSubject(subjectId).catch(() => null),
        createQuizCta(subjectId, subSubjectId, lessonId, null).catch(() => null),
      ]);
    } catch (err) {
      if (nav?.stale) return;
      empty(contentSlot);
      contentSlot.appendChild(
        createEmptyState({ message: `Couldn't load this lesson (${err.message}).`, iconName: "triangle-exclamation" })
      );
      return;
    }

    if (nav?.stale) return;

    // Derive subSubject in-memory from the already-fetched subject.
    const subSubject = subSubjectId
      ? (subject?.subSubjects?.find((s) => s.id === subSubjectId) ?? null)
      : null;

    document.title = `${lesson.title} — OpenKnowledge`;
    // Power the home page's "continue where you left off" card. Recorded
    // on successful load so failed fetches don't poison the resume slot.
    rememberLesson({ subjectId, subSubjectId, lessonId, title: lesson.title });

    // ── Render Phase A content ──────────────────────────────────────────────
    empty(contentSlot);
    // Reading-progress bar lives OUTSIDE the reader card (fixed, under the
    // header) but is appended inside contentSlot so the route swap destroys
    // it — its scroll listener self-removes once disconnected.
    const readerCard = createEl("div", { class: "ou-reader-card" }, [
      createLessonHeader(lesson, subject?.title),
      createEl("div", { class: "ou-cluster ou-reader-meta-row" }, [
        createLessonProgressControl(subjectId, subSubjectId, lessonId, { completed: progress?.completed }),
        createBookmarkButton(subjectId, subSubjectId, lessonId),
      ]),
      lesson.isFallback ? createTranslationFallbackNotice(lesson.requestedLang) : null,
      createLessonContent(lesson.html),
    ].filter(Boolean));
    contentSlot.append(
      createReadingProgress(readerCard),
      createEl("div", { class: "ou-reader-top-controls" }, [
        createEl("a", {
          href: subSubjectId
            ? `#/subjects/${subjectId}/${subSubjectId}`
            : `#/subjects/${subjectId}`,
          class: "ou-back-link",
        }, [
          icon("chevron-left"),
          `Back to ${subSubject?.title || subject?.title || "lessons"}`,
        ]),
        createEl("div", { class: "ou-cluster" }, [
          createLanguageSwitcher(lang, renderLanguage),
          createExportPdfButton({ subjectId, subSubjectId, lessonId, lang }),
        ]),
      ]),
      readerCard,
      ...(quizCta ? [quizCta] : []),
    );

    wireLessonShortcuts(readerCard);

    // ── Phase B: deferred secondary content ─────────────────────────────────
    // Runs after Phase A paint is committed. The user can already read the
    // lesson. Nav/related/notes fill in below without janking the scroll.
    loadSecondaryContent({ subjectId, subSubjectId, lessonId, nav, secondarySlot });
  }

  await renderLanguage(requestedLang);
}

/**
 * Loads and injects the below-the-fold secondary content (prev/next nav,
 * related lessons, notes panel) without blocking the lesson body render.
 * Uses requestIdleCallback when available so it truly defers to idle time;
 * falls back to setTimeout(0) which at minimum yields to the browser paint.
 */
function loadSecondaryContent({ subjectId, subSubjectId, lessonId, nav, secondarySlot }) {
  const work = async () => {
    if (nav?.stale) return;
    try {
      const [lessonNav, related, notes] = await Promise.all([
        createLessonNavigation(subjectId, subSubjectId, lessonId).catch(() => null),
        createRelatedLessons(subjectId, subSubjectId, lessonId).catch(() => null),
        createNotesPanel(subjectId, subSubjectId, lessonId).catch(() => null),
      ]);
      if (nav?.stale) return;
      const fragments = [lessonNav, related, notes].filter(Boolean);
      if (fragments.length) {
        const wrapper = createEl("div", { class: "ou-stack" }, fragments);
        // Fade secondary content in smoothly.
        wrapper.style.animation = "ou-fade-in 300ms ease both";
        secondarySlot.appendChild(wrapper);
      }
    } catch {
      // Secondary content is non-critical — silently swallow errors.
    }
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(work, { timeout: 1500 });
  } else {
    setTimeout(work, 0);
  }
}

/**
 * Keyboard navigation for lesson pages: ← / ← previous, → next.
 * Wired against the (Phase B) prev/next links once they exist; the
 * listener self-removes when the card is destroyed by a route change —
 * same isConnected contract as reading-progress.js. Ignored while the
 * user is typing (notes field, palette, …) or holding modifier keys.
 */
function wireLessonShortcuts(readerCard) {
  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!readerCard.isConnected) {
      document.removeEventListener("keydown", onKey);
      return;
    }
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    const [prev, next] = document.querySelectorAll(".ou-lesson-nav__link");
    const link = e.key === "ArrowLeft" ? prev : next;
    if (link) {
      e.preventDefault();
      link.click();
    }
  }
  document.addEventListener("keydown", onKey);
}
