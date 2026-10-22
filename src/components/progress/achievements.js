// src/components/progress/achievements.js — simple milestone rules,
// evaluated client-side from stats already in progress-engine.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

const MILESTONES = [
  { id: "first-lesson", label: "First lesson complete", iconName: "graduation-cap", test: (s) => s.lessonsCompleted >= 1 },
  { id: "five-lessons", label: "5 lessons complete", iconName: "book", test: (s) => s.lessonsCompleted >= 5 },
  { id: "streak-3", label: "3-day streak", iconName: "fire", test: (s) => s.streak >= 3 },
  { id: "streak-7", label: "7-day streak", iconName: "fire", test: (s) => s.streak >= 7 },
  { id: "high-accuracy", label: "90%+ quiz accuracy", iconName: "trophy", test: (s) => s.accuracy >= 0.9 },
];

export function getEarnedAchievements(stats) {
  return MILESTONES.filter((m) => m.test(stats));
}

const HINTS = {
  "first-lesson": "Complete any lesson.",
  "five-lessons": "Complete 5 lessons.",
  "streak-3": "Study 3 days in a row.",
  "streak-7": "Study 7 days in a row.",
  "high-accuracy": "Average 90% or more across quizzes.",
};

/** Earned milestones first, then the locked ones as visible goals —
 *  a list that only ever shows what you already have gives nothing to
 *  aim at. */
export function createAchievementsList(stats) {
  const earnedIds = new Set(getEarnedAchievements(stats).map((m) => m.id));
  const ordered = [...MILESTONES.filter((m) => earnedIds.has(m.id)), ...MILESTONES.filter((m) => !earnedIds.has(m.id))];
  return createEl("ul", { role: "list", class: "ou-badges" }, ordered.map((m) => {
    const got = earnedIds.has(m.id);
    return createEl("li", { class: `ou-badge${got ? " is-earned" : " is-locked"}` }, [
      createEl("span", { class: "ou-badge__icon", "aria-hidden": "true" }, [icon(got ? m.iconName : "lock")]),
      createEl("span", { class: "ou-badge__body" }, [
        createEl("span", { class: "ou-badge__title" }, [m.label]),
        createEl("span", { class: "ou-badge__hint" }, [got ? "Earned" : `Locked — ${HINTS[m.id]}`]),
      ]),
    ]);
  }));
}
