// src/pages/progress.js
import { createEl, mount } from "../utils/dom.js";
import { getLearningStatistics } from "../engines/progress-engine.js";
import { createProgressCard } from "../components/progress/progress-card.js";
import { createProgressChart } from "../components/progress/progress-chart.js";
import { createStreakBadge } from "../components/progress/streak.js";
import { createAchievementsList } from "../components/progress/achievements.js";

export async function render(container) {
  document.title = "Your progress — OpenKnowledge";
  const stats = await getLearningStatistics();
  const chartData = Object.entries(stats.subjectProgress).map(([label, value]) => ({ label, value }));
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Your progress"]),
    createProgressCard(stats),
    createStreakBadge(stats.streak),
    chartData.length ? createProgressChart(chartData) : null,
    createEl("h2", {}, ["Achievements"]),
    createAchievementsList(stats),
  ]));
}
