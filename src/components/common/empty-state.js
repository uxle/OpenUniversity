// src/components/common/empty-state.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

export function createEmptyState({ message, actionLabel = null, onAction = null, iconName = "inbox" }) {
  const children = [
    // Decorative pastel spark — makes "nothing here" feel friendly, not broken.
    createEl("div", { class: "ou-spark-dots", "aria-hidden": "true" }, [createEl("i")]),
    icon(iconName, { class: "ou-empty-state__icon" }),
    createEl("p", { class: "ou-text-secondary" }, [message]),
  ];
  if (actionLabel && onAction) {
    children.push(createEl("button", { type: "button", class: "ou-btn ou-btn--ghost", on: { click: onAction } }, [actionLabel]));
  }
  return createEl("div", { class: "ou-empty-state" }, children);
}
