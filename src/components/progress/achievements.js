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

export function createAchievementsList(stats) {
  const earned = getEarnedAchievements(stats);
  if (!earned.length) return createEl("p", { class: "ou-text-secondary" }, ["No achievements yet — keep learning!"]);
  return createEl("ul", { role: "list", class: "ou-cluster" }, earned.map((m) =>
    createEl("li", { class: "ou-card ou-card--interactive ou-cluster" }, [icon(m.iconName), m.label])
  ));
}
