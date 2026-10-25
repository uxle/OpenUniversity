// src/components/mcq/mcq-option.js — a single answer choice button.
// Option text is Zolto: math, code and bold work (plain text stays plain).
import { createEl } from "../../utils/dom.js";
import { setRich } from "../../utils/rich-text.js";

export function createMcqOption(text, { onSelect, state = null } = {}) {
  const classes = ["ou-mcq-option"];
  if (state === "correct") classes.push("ou-mcq-option--correct");
  if (state === "incorrect") classes.push("ou-mcq-option--incorrect");
  const label = setRich(createEl("span", { class: "ou-mcq-option__text" }), text, { inline: true });
  return createEl("button", {
    type: "button", class: classes, disabled: state !== null,
    on: onSelect ? { click: onSelect } : {},
  }, [label]);
}
