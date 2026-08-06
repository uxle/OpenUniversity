// src/components/mcq/mcq-progress.js
import { createEl } from "../../utils/dom.js";

export function createMcqProgress(current, total) {
  const ratio = total ? current / total : 0;
  return createEl("div", { class: "ou-progress-bar", role: "progressbar", "aria-valuenow": String(current), "aria-valuemin": "0", "aria-valuemax": String(total) }, [
    createEl("div", { class: "ou-progress-bar__fill", style: `--ou-progress:${ratio}` }),
  ]);
}
