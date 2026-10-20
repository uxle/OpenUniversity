// src/utils/icon.js — inline SVG icon helper.
//
// Previously a Font Awesome helper: index.html pulled fa all.min.css from
// the cdnjs CDN and this factory emitted `<i class="fa-solid fa-…">`.
// That made the CDN the app's only runtime network dependency (≈100 KB +
// webfonts for the ~35 glyphs actually used), flashed unstyled/tofu icons
// on slow links, and broke the works-offline / file:// promise.
//
// The replacement (icons.js) inlines a Lucide-style 24×24 stroke set —
// same call signature, same accessibility contract:
//   - `label`  → the icon CONVEYS meaning: role="img" + aria-label.
//   - no label → decorative: aria-hidden="true" (text beside it explains).
// Size/spacing keep working because svg gets width/height: 1em and the
// same classes callers already target (`.ou-quick-action i, … svg` etc.).
//
// src/engines/mcq-engine.js deliberately still uses its plain ✓/✕ glyphs:
// that file is meant to run with zero dependencies (even this import).

import { createEl } from "./dom.js";
import { iconSvg } from "./icons.js";

/**
 * @param {string} name - icon name, e.g. "sun", "moon", "bookmark"
 *   (Font Awesome names are kept as keys so no call site changed)
 * @param {{ label?: string, class?: string|string[] }} [opts] - `label` makes the icon convey meaning on
 *   its own (aria-label, not aria-hidden); omit it when the icon sits beside visible text or inside a
 *   button that already has its own aria-label — then the icon stays decorative (aria-hidden="true").
 */
export function icon(name, { label = null, class: extraClass = [] } = {}) {
  const classes = ["ou-icon", ...[].concat(extraClass)];
  const body = iconSvg(name);
  if (!body) {
    // Unknown name: previously an FA class would just render a tofu box;
    // now we fall back to a neutral dot so layouts never show raw markup.
    return createEl("span", {
      class: [...classes, "ou-icon--unknown"].join(" "),
      ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" }),
    }, "•");
  }
  const attrs = {
    class: classes.join(" "),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    width: "1em",
    height: "1em",
  };
  if (label) {
    attrs["aria-label"] = label;
    attrs.role = "img";
  } else {
    attrs["aria-hidden"] = "true";
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
  svg.innerHTML = body;
  return svg;
}
