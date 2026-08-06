// src/components/mcq/mcq-option.js — a single answer choice button.
import { createEl } from "../../utils/dom.js";

export function createMcqOption(text, { onSelect, state = null } = {}) {
  const classes = ["ou-mcq-option"];
  if (state === "correct") classes.push("ou-mcq-option--correct");
  if (state === "incorrect") classes.push("ou-mcq-option--incorrect");
  return createEl("button", {
    type: "button", class: classes, disabled: state !== null,
    on: onSelect ? { click: onSelect } : {},
  }, [text]);
}
