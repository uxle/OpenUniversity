// src/pages/home.js
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { listSubjects } from "../engines/subject-engine.js";
import { createSubjectList } from "../components/subject/subject-list.js";
import { getLearningStatistics } from "../engines/progress-engine.js";
import { createProgressCard } from "../components/progress/progress-card.js";

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

export async function render(container) {
  document.title = "OpenKnowledge";
  const [{ subjects, failed }, stats] = await Promise.all([
    loadSubjects(),
    getLearningStatistics().catch(() => ({ lessonsCompleted: 0, mcqsAnswered: 0, accuracy: 0 })),
  ]);
  const totalLessons = subjects.reduce((sum, s) => sum + (s.lessonCount ?? 0), 0);

  const sections = [
    createEl("div", {}, [
      createEl("h1", { class: "ou-hero-heading" }, ["Learn anything.", createEl("br"), "Anywhere."]),
      createEl("p", { class: "ou-hero-subtext" }, ["Free public knowledge across core subjects. No accounts, zero paywalls."]),
    ]),
    createProgressCard(stats, totalLessons),
  ];

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
