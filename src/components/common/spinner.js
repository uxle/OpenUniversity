// src/components/common/spinner.js
import { createEl } from "../../utils/dom.js";

export function createSpinner({ label = "Loading…" } = {}) {
  return createEl("div", { class: "ou-spinner", role: "status" }, [
    createEl("span", { class: "ou-visually-hidden" }, [label]),
  ]);
}
