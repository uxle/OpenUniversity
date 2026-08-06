// src/components/progress/progress-card.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { formatPercent } from "../../utils/format.js";
import { pluralize } from "../../utils/text.js";
import { createProgressRing } from "./progress-ring.js";

/**
 * @param {{ lessonsCompleted: number, mcqsAnswered: number, accuracy: number }} stats
 * @param {number} [totalLessons] - sitewide lesson count, for the ring and
 *   the "x / y lessons" line. When unknown/0, falls back to a plain count
 *   with no denominator (ring shows "Start" until something's completed).
 */
export function createProgressCard({ lessonsCompleted, mcqsAnswered, accuracy }, totalLessons = 0) {
  const ratio = totalLessons > 0 ? lessonsCompleted / totalLessons : 0;
  const lessonLabel = totalLessons > 0
    ? `${lessonsCompleted} / ${totalLessons} ${pluralize("lesson", totalLessons)} completed`
    : `${lessonsCompleted} ${pluralize("lesson", lessonsCompleted)} completed`;
  const actionLabel = lessonsCompleted === 0
    ? "Start learning"
    : totalLessons > 0 && lessonsCompleted >= totalLessons
      ? "All lessons completed"
      : "Continue learning";

  return createEl("a", { href: "#/progress", class: "ou-card ou-card--interactive ou-progress-card" }, [
    createEl("div", { class: "ou-cluster", style: "gap: var(--ou-space-4);" }, [
      createProgressRing(ratio),
      createEl("div", {}, [
        createEl("div", { class: "ou-card__title" }, [lessonLabel]),
        createEl("div", { class: "ou-text-sm ou-text-secondary" }, [actionLabel]),
        createEl("div", { class: "ou-text-sm ou-text-secondary ou-tabular-nums" }, [`${mcqsAnswered} ${pluralize("quiz", mcqsAnswered, "quizzes")} answered · ${formatPercent(accuracy)} accuracy`]),
      ]),
    ]),
    icon("chevron-right", { class: "ou-progress-card__chevron" }),
  ]);
}
