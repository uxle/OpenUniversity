// src/components/common/tooltip.js — simple title-attribute-based tooltip
// with an accessible describedby fallback for richer content.
import { createEl } from "../../utils/dom.js";
import { uid } from "../../utils/ids.js";

export function attachTooltip(el, text) {
  const id = uid("tooltip");
  const tip = createEl("span", { id, role: "tooltip", class: "ou-visually-hidden" }, [text]);
  el.setAttribute("aria-describedby", id);
  el.title = text;
  el.appendChild(tip);
  return () => { el.removeAttribute("aria-describedby"); tip.remove(); };
}
