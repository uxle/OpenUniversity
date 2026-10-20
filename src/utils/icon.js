// src/utils/icon.js — Font Awesome solid icon helper.
//
// Emits `<i class="fa-solid fa-… ou-icon">` backed by the SELF-HOSTED,
// SUBSETTED fa-solid-900.min.woff2 (see tools/build-icon-font.py — the
// font carries only the glyphs this app uses, a few KB, no CDN, works
// offline and from file://). The glyph renders via CSS ::before content,
// so unlike the old inline-SVG helper there is no stroke/fill plumbing —
// icons size with font-size (width/height 1em equivalent) and color with
// currentColor exactly like they did.
//
// Same accessibility contract as before:
//   - `label`  → the icon CONVEYS meaning: role="img" + aria-label.
//   - no label → decorative: aria-hidden="true" (text beside it explains).
//
// Legacy names ("home", "command", "sparkles", Material-Symbols names…)
// keep working through ALIASES in icons.js; unknown names fall back to a
// neutral dot so layouts never show raw markup or tofu boxes.
//
// src/engines/mcq-engine.js deliberately still uses its plain ✓/✕ glyphs:
// that file is meant to run with zero dependencies (even this import).

import { createEl } from "./dom.js";
import { resolveIconName } from "./icons.js";

/**
 * @param {string} name - icon name, e.g. "sun", "moon", "bookmark"
 *   (FA6 free-solid canonical names; legacy/Lucide/Material names resolve
 *   via aliases)
 * @param {{ label?: string, class?: string|string[] }} [opts] - `label` makes the icon convey meaning on
 *   its own (aria-label, not aria-hidden); omit it when the icon sits beside visible text or inside a
 *   button that already has its own aria-label — then the icon stays decorative (aria-hidden="true").
 */
export function icon(name, { label = null, class: extraClass = [] } = {}) {
  const classes = ["ou-icon", "fa-solid", ...[].concat(extraClass)];
  const canonical = resolveIconName(name);
  if (!canonical) {
    // Unknown name: an FA class would just render a tofu box; fall back
    // to a neutral dot so layouts never show raw markup.
    return createEl("span", {
      class: [...classes, "ou-icon--unknown"].join(" "),
      ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" }),
    }, "•");
  }
  classes.push(`fa-${canonical}`);
  const attrs = {
    class: classes.join(" "),
    // Keep parity with the old 1em sizing so existing CSS
    // (`font-size` on the icon) still scales glyphs exactly.
    ...(!label ? { "aria-hidden": "true" } : {}),
  };
  if (label) {
    attrs["aria-label"] = label;
    attrs.role = "img";
  }
  return createEl("i", attrs);
}
