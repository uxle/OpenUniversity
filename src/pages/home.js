// src/pages/home.js
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { listSubjects } from "../engines/subject-engine.js";
import { createSubjectList } from "../components/subject/subject-list.js";
import { getLearningStatistics } from "../engines/progress-engine.js";
import { createProgressCard } from "../components/progress/progress-card.js";
import { getLastLesson } from "../components/lesson/last-lesson.js";
import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../app/constants.js";

async function loadSubjects() {
  try {
    return { subjects: await listSubjects(), failed: false };
  } catch {
    return { subjects: [], failed: true };
  }
}

function createQuickAction(href, iconName, label) {
  return createEl("a", { href, class: "ou-card ou-card--interactive ou-quick-action" }, [
    icon(iconName), createEl("span", {}, [label]),
  ]);
}

/** "10 subjects · 305 lessons · 100% free" — provenance line under the hero. */
function createHeroStats(totalLessons, subjectCount) {
  return createEl("div", { class: "ou-hero-stats", "aria-label": `${subjectCount} subjects, ${totalLessons} lessons, free for everyone` }, [
    createEl("span", { class: "ou-hero-stat" }, [icon("book-open"), `${subjectCount} ${subjectCount === 1 ? "subject" : "subjects"}`]),
    createEl("span", { class: "ou-hero-stat" }, [icon("graduation-cap"), `${totalLessons} lessons`]),
    createEl("span", { class: "ou-hero-stat" }, [icon("circle-check"), "Always free"]),
  ]);
}

/** Opens the command palette (input-shaped button; palette listens for
 *  the event so this page stays decoupled from the shell component). */
function createHeroSearch() {
  return createEl("button", {
    type: "button",
    class: "ou-hero-search",
    "aria-label": "Search lessons and subjects (opens the command palette)",
    on: { click: () => eventBus.emit(EVENTS.PALETTE_OPEN) },
  }, [
    icon("magnifying-glass"),
    createEl("span", { class: "ou-hero-search__placeholder" }, ["Search lessons, subjects…"]),
    createEl("kbd", { class: "ou-hero-search__kbd" }, ["Ctrl K"]),
  ]);
}

/** Resume card for the last opened, not-yet-finished lesson. */
function createContinueCard(last) {
  const href = last.subSubjectId
    ? `#/subjects/${last.subjectId}/${last.subSubjectId}/lessons/${last.lessonId}`
    : `#/subjects/${last.subjectId}/lessons/${last.lessonId}`;
  return createEl("a", { href, class: "ou-card ou-card--interactive ou-continue-card" }, [
    createEl("div", { class: "ou-continue-card__icon" }, [icon("play")]),
    createEl("div", { class: "ou-continue-card__body" }, [
      createEl("div", { class: "ou-continue-card__eyebrow" }, ["Continue where you left off"]),
      createEl("div", { class: "ou-card__title" }, [last.title || last.lessonId]),
    ]),
    icon("arrow-right", { class: "ou-continue-card__chevron" }),
  ]);
}

export async function render(container, _params, nav = null) {
  document.title = "OpenKnowledge";
  const [{ subjects, failed }, stats] = await Promise.all([
    loadSubjects(),
    getLearningStatistics().catch(() => ({ lessonsCompleted: 0, mcqsAnswered: 0, accuracy: 0 })),
  ]);
  const totalLessons = subjects.reduce((sum, s) => sum + (s.lessonCount ?? 0), 0);

  const sections = [
    createEl("div", { class: "ou-hero" }, [
      createEl("h1", { class: "ou-hero-heading" }, [
        "Learn anything.", createEl("br"),
        createEl("span", { class: "ou-hero-heading__accent" }, ["Anywhere."]),
      ]),
      createEl("p", { class: "ou-hero-subtext" }, ["Free public knowledge across core subjects. No accounts, zero paywalls."]),
      createHeroSearch(),
      createHeroStats(totalLessons, subjects.length),
    ]),
  ];

  // Continue-learning first (returning users' #1 job), then the ring.
  // Shows whenever a lesson was opened recently — completion state isn't
  // worth a fetch here; the resume card is useful mid-lesson even if the
  // ring says 0 completed (that's exactly the "come back tomorrow" case).
  const last = getLastLesson();
  if (last) {
    sections.push(createContinueCard(last));
  }
  sections.push(createProgressCard(stats, totalLessons));

  if (stats.lessonsCompleted === 0) {
    sections.push(createEl("div", { class: "ou-grid ou-grid--quick-actions" }, [
      createQuickAction("#/subjects", "book-open", "Browse subjects"),
      createQuickAction("#/search", "magnifying-glass", "Search a topic"),
      createQuickAction("#/contribute", "code-branch", "Contribute a lesson"),
    ]));
  }

  sections.push(createEl("div", { class: "ou-section-title-row" }, [
    createEl("h2", {}, ["Subjects"]),
    createEl("a", { href: "#/subjects", class: "ou-link ou-text-sm" }, ["See all →"]),
  ]));
  sections.push(createSubjectList(subjects, { failed, onRetry: () => render(container) }));

  mount(container, createEl("div", { class: "ou-stack ou-stack--loose" }, sections));
}
