// src/components/mcq/mcq-progress.js
//
// v2: the bar is paired with a visible "Question N of M" label (position is
// the first thing a test-taker needs to know — Nielsen #1, visibility of
// system status). `current` is the 0-based index of the question on screen,
// so the bar shows how many have been ANSWERED while the label names the
// one being ANSWERED. aria-valuetext gives screen readers the same sentence.
import { createEl } from "../../utils/dom.js";

export function createMcqProgress(current, total) {
  const ratio = total ? current / total : 0;
  const position = Math.min(current + 1, total || 1);
  const sentence = `Question ${position} of ${total}`;
  return createEl("div", { class: "ou-mcq-progress" }, [
    createEl("div", { class: "ou-mcq-progress__label ou-tabular-nums" }, [
      createEl("span", {}, [sentence]),
      createEl("span", { class: "ou-mcq-progress__pct" }, [`${Math.round(ratio * 100)}%`]),
    ]),
    createEl("div", {
      class: "ou-progress-bar",
      role: "progressbar",
      "aria-label": "Quiz progress",
      "aria-valuenow": String(current),
      "aria-valuemin": "0",
      "aria-valuemax": String(total),
      "aria-valuetext": sentence,
    }, [
      createEl("div", { class: "ou-progress-bar__fill", style: `--ou-progress:${ratio}` }),
    ]),
  ]);
}
