// src/components/subject/subject-progress.js
import { createEl } from "../../utils/dom.js";
import { formatPercent } from "../../utils/format.js";

/** @param {number} ratio 0..1 */
export function createSubjectProgress(ratio = 0) {
  return createEl("div", { class: "ou-cluster" }, [
    createEl("div", { class: "ou-progress-bar", style: "flex:1", role: "progressbar", "aria-valuenow": String(Math.round(ratio * 100)), "aria-valuemin": "0", "aria-valuemax": "100" }, [
      createEl("div", { class: "ou-progress-bar__fill", style: `--ou-progress:${ratio}` }),
    ]),
    createEl("span", { class: "ou-text-sm" }, [formatPercent(ratio)]),
  ]);
}
