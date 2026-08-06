// src/components/search/search-filters.js — horizontally scrollable
// filter pills (matches the reference), replacing an earlier <select>.
import { createEl } from "../../utils/dom.js";

/** @param {{id,title}[]} subjects @param {(subjectId: string|null) => void} onChange */
export function createSearchFilters(subjects, onChange) {
  let active = null;
  const buttons = [];

  function select(button, subjectId) {
    active = subjectId;
    buttons.forEach((b) => b.classList.toggle("ou-pill--active", b === button));
    onChange(subjectId);
  }

  const allButton = createEl("button", { type: "button", class: "ou-pill ou-pill--active" }, ["All topics"]);
  allButton.addEventListener("click", () => select(allButton, null));
  buttons.push(allButton);

  const subjectButtons = subjects.map((s) => {
    const btn = createEl("button", { type: "button", class: "ou-pill" }, [s.title]);
    btn.addEventListener("click", () => select(btn, s.id));
    buttons.push(btn);
    return btn;
  });

  return createEl("div", { class: "ou-pill-row" }, [allButton, ...subjectButtons]);
}
