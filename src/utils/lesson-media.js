// src/utils/lesson-media.js — post-render enhancements for compiled Zolto
// lesson HTML. Both fixes exist because of real mobile measurements:
//
// 1. enhanceLessonMedia — WIDE DIAGRAMS. Zolto emits <svg class="zl-diagram"
//    with a viewBox sized to its content (a 9-node tree was 1886 units
//    wide). The CSS (`max-width:100%; height:auto`) shrink-to-fits it into
//    the lesson column: on a 320px phone that scale was 0.13, rendering
//    the diagram's 14px labels at ~1.8px — physically unreadable. For
//    diagrams whose aspect would drop text below legible size, we re-wrap
//    the svg in a horizontally pannable .ou-media-scroll and give the svg
//    a width that keeps ~9px+ text, exactly like wide tables already
//    scroll in .zl-table-wrap. Narrow diagrams keep shrink-to-fit.
//
// 2. rewriteVendorIcons — the vendored Zolto renderer (directive-renderer.js)
//    emits icon glyphs as <span class="material-symbols-rounded">info</span>
//    — Material Symbols font LIGATURES. That font was never loaded (it
//    would be another 100-300 KB runtime dependency), so any lesson using
//    @alert/@card/@tabs/@steps icons rendered the literal WORD ("info",
//    "person", "warning") as fake-looking "icons". We rewrite those spans
//    to real fa-solid glyphs via the ALIASES map in icons.js (which covers
//    the Material names Zolto actually emits); unknown names fall back to
//    circle-info so nothing ever shows raw ligature text.

import { icon } from "./icon.js";
import { resolveIconName } from "./icons.js";

/** Below this rendered scale (svg px per viewBox unit) label text
 *  (typically 12-14 units) becomes unreadable — switch to panning. */
const MIN_LEGIBLE_SCALE = 0.5;
/** Target scale when re-sizing a wide diagram: renders 14-unit labels at
 *  ~9px — small but readable, and pinch-zoom still works. */
const TARGET_SCALE = 0.65;
/** Diagrams narrower than this stay shrink-to-fit (they scale fine). */
const WIDE_THRESHOLD = 700;

function wrapWideDiagram(svg) {
  if (svg.closest(".ou-media-scroll")) return;
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/);
  const vbW = parseFloat(vb[2]);
  if (!Number.isFinite(vbW) || vbW <= 0) return;
  const clientW = svg.clientWidth;
  if (!clientW) return; // not laid out yet; caller defers via rAF
  const naturalScale = clientW / vbW;
  if (vbW < WIDE_THRESHOLD || naturalScale >= MIN_LEGIBLE_SCALE) return;

  const wrap = document.createElement("div");
  wrap.className = "ou-media-scroll";
  svg.replaceWith(wrap);
  wrap.appendChild(svg);
  // width + maxWidth:none — the stylesheet's max-width:100% would
  // otherwise cap the rendered width below our legibility target.
  svg.style.width = `${Math.ceil(vbW * TARGET_SCALE)}px`;
  svg.style.maxWidth = "none";
}

function rewriteVendorIcons(root) {
  // Scoped to the vendor's exact class so app icons are never touched.
  root.querySelectorAll("span.material-symbols-rounded").forEach((span) => {
    const name = (span.textContent || "").trim();
    const glyph = icon(resolveIconName(name) || "circle-info");
    span.replaceWith(glyph);
  });
}

/**
 * Apply all mobile-robustness fixes to a mounted Zolto content container.
 * Safe to call multiple times (idempotent by construction).
 * @param {HTMLElement} root - element whose subtree holds compiled Zolto HTML
 */
export function enhanceLessonMedia(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  rewriteVendorIcons(root);
  // Next frame: the container is in the document and laid out by then,
  // so clientWidth measurements are real.
  requestAnimationFrame(() => {
    root.querySelectorAll("svg.zl-diagram").forEach(wrapWideDiagram);
  });
}
