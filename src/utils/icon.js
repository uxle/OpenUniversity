// src/utils/icon.js — Font Awesome Free (solid) icon helper.
// Loaded via CDN in index.html (<link> to Font Awesome's all.min.css) —
// see index.html and AGENTS.txt icon guidance. Kept out of
// src/engines/mcq-engine.js on purpose: that file is deliberately
// dependency-free (works offline via file://), so it keeps its plain
// ✓/✕ glyphs instead of taking on a CDN font dependency.

import { createEl } from "./dom.js";

/**
 * @param {string} name - Font Awesome icon name without the "fa-" prefix, e.g. "sun", "moon", "bookmark"
 * @param {{ label?: string, class?: string|string[] }} [opts] - `label` makes the icon convey meaning on
 *   its own (aria-label, not aria-hidden); omit it when the icon sits beside visible text or inside a
 *   button that already has its own aria-label — then the icon stays decorative (aria-hidden="true").
 */
export function icon(name, { label = null, class: extraClass = [] } = {}) {
  const classes = ["fa-solid", `fa-${name}`, ...[].concat(extraClass)];
  const attrs = { class: classes };
  if (label) {
    attrs["aria-label"] = label;
    attrs.role = "img";
  } else {
    attrs["aria-hidden"] = "true";
  }
  return createEl("i", attrs);
}
