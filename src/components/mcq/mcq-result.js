// src/components/mcq/mcq-result.js
import { createEl } from "../../utils/dom.js";
import { formatScore } from "../../utils/format.js";
import { createButton } from "../common/button.js";

export function createMcqResult(correct, total, { onRetry } = {}) {
  return createEl("div", { class: "ou-mcq-result" }, [
    createEl("div", { class: ["ou-mcq-result__score", "ou-tabular-nums"] }, [formatScore(correct, total)]),
    onRetry ? createButton({ label: "Retry", variant: "secondary", onClick: onRetry }) : null,
  ]);
}
