// src/components/common/button.js
import { createEl } from "../../utils/dom.js";

/** @param {{ label: string, onClick?: Function, variant?: "primary"|"secondary"|"ghost"|"danger", size?: "sm"|"md", disabled?: boolean, icon?: Node }} opts */
export function createButton({ label, onClick, variant = "primary", size = "md", disabled = false, icon = null }) {
  const classes = ["ou-btn", `ou-btn--${variant}`];
  if (size === "sm") classes.push("ou-btn--sm");
  const btn = createEl("button", {
    type: "button",
    class: classes,
    disabled,
    "aria-label": icon && !label ? label : undefined,
    on: onClick ? { click: onClick } : {},
  }, [icon, label].filter(Boolean));
  return btn;
}
