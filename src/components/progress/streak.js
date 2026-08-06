// src/components/progress/streak.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

/** @param {number} days */
export function createStreakBadge(days) {
  return createEl("div", { class: "ou-card ou-cluster" }, [
    icon("fire", { label: `${days} day streak` }),
    createEl("div", {}, [
      createEl("div", { class: "ou-card__title" }, [`${days}-day streak`]),
      createEl("div", { class: "ou-card__subtitle" }, [
        days > 0 ? "Keep it going!" : "Study today to start a streak.",
      ]),
    ]),
  ]);
}
