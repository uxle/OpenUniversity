// src/pages/profile.js — a local-only profile. It used to show one red
// "Clear local profile" button and no way to SET a name, so the only
// available action was destructive. Now: set your name, see where you
// are, jump to your data, and keep the reset as a quiet last resort.
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { createProfileView } from "../components/account/profile.js";
import { getLocalProfile, updateLocalProfile } from "../engines/account-engine.js";
import { getLearningStatistics } from "../engines/progress-engine.js";
import { showToast } from "../components/common/toast.js";
import { formatPercent } from "../utils/format.js";

const LINKS = [
  { label: "Your progress", text: "Lessons, quizzes and streak", path: "/progress", iconName: "chart-line" },
  { label: "Bookmarks", text: "Lessons you saved", path: "/bookmarks", iconName: "bookmark" },
  { label: "Notes", text: "Everything you have written", path: "/notes", iconName: "note-sticky" },
  { label: "Settings", text: "Language, accessibility, display", path: "/settings", iconName: "gear" },
];

export async function render(container) {
  document.title = "Profile — OpenKnowledge";
  const stats = await getLearningStatistics().catch(() => null);

  const input = createEl("input", {
    type: "text", id: "ou-profile-name", class: "ou-profile-input", maxlength: "40",
    autocomplete: "nickname", placeholder: "e.g. Asha", value: (await getLocalProfile()).displayName || "",
  });
  const form = createEl("form", {
    class: "ou-card ou-profile-form",
    on: {
      submit: async (e) => {
        e.preventDefault();
        await updateLocalProfile({ displayName: input.value.trim() });
        showToast("Name saved", "success");
        render(container);
      },
    },
  }, [
    createEl("label", { for: "ou-profile-name", class: "ou-profile-label" }, ["Display name"]),
    createEl("p", { class: "ou-text-sm ou-text-secondary" }, ["Stored only on this device. Used for your avatar initials."]),
    createEl("div", { class: "ou-profile-form__row" }, [
      input,
      createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Save"]),
    ]),
  ]);

  const summary = stats ? createEl("p", { class: "ou-text-sm ou-text-secondary ou-tabular-nums" }, [
    `${stats.lessonsCompleted} lessons completed · ${stats.mcqsAnswered} quizzes · ${stats.mcqsAnswered ? formatPercent(stats.accuracy) : "—"} accuracy · ${stats.streak}\u2011day streak`,
  ]) : null;

  const links = createEl("div", { class: "ou-card ou-prog-list" }, LINKS.map((l) =>
    createEl("a", { href: `#${l.path}`, class: "ou-link-row" }, [
      createEl("span", { class: "ou-link-row__icon", "aria-hidden": "true" }, [icon(l.iconName)]),
      createEl("span", { class: "ou-link-row__body" }, [
        createEl("span", { class: "ou-link-row__title" }, [l.label]),
        createEl("span", { class: "ou-link-row__text" }, [l.text]),
      ]),
      icon("chevron-right", { class: "ou-prog-row__chev" }),
    ])));

  const reset = createEl("button", {
    type: "button", class: "ou-btn ou-btn--ghost ou-profile-reset",
    on: { click: async () => {
      if (!window.confirm("Clear your display name? Your progress, bookmarks and notes are not affected.")) return;
      await updateLocalProfile({ displayName: "" });
      showToast("Display name cleared", "info");
      render(container);
    } },
  }, ["Clear display name"]);

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Profile"]),
    await createProfileView(),
    summary,
    form,
    links,
    reset,
  ]));
}
