// src/engines/zolto/zolto-engine.js
//
// Thin adapter around the real Zolto package (github.com/uxle/Zolto,
// published as `zolto` on npm as of v1.0.2 — https://www.npmjs.com/package/zolto).
//
// History: this used to fall back to a hand-written, intentionally partial
// local implementation (mini-zolto.js — Phase 1/2/4 only: headings,
// paragraphs, lists, tables, admonitions, math) because `zolto` wasn't yet
// published to the npm registry and both `npm install` and the esm.sh CDN
// fallback 404'd. That's resolved now that the package is live, so this
// adapter imports the real thing.
//
// It's vendored (copied into ./vendor/zolto/) rather than pulled from
// node_modules or a CDN, to preserve this repo's "zero install, zero
// network calls at runtime" property for static hosting (GitHub Pages,
// file:// double-click, etc.) — the same goal mini-zolto.js existed for,
// now satisfied by the real, full-featured package instead of a subset
// reimplementation. The vendored copy corresponds to zolto@1.0.2 on npm;
// see ./vendor/zolto/zolto.js for VERSION/PHASE constants.

import {
  compile,
  parse,
  render,
  parseInteractive,
  renderInteractive,
} from "./vendor/zolto/zolto.js";
import { parseMath } from "./vendor/zolto/math-parser.js";
import { renderMathHTML, mathToPlainText, MATH_CSS } from "./vendor/zolto/math-renderer.js";
import { renderMathML } from "./vendor/zolto/math-mathml.js";

/**
 * Compile a Zolto (.zl) lesson source string straight to HTML.
 * Carries Zolto's own no-throw guarantee for malformed *content* (bad
 * syntax renders as an inline error node, never throws) — extended here
 * to non-string input too (e.g. `undefined` from a failed fetch), which
 * the real `compile()` does throw on. Guarding it here keeps this
 * adapter's documented contract true regardless of that upstream detail.
 * @param {string} source - raw .zl file contents
 * @param {{ xhtml?: boolean, footnoteSection?: boolean }} [opts]
 * @returns {string} HTML
 */
export function compileLesson(source, opts = {}) {
  if (typeof source !== "string") {
    return `<p class="zl-render-error">Could not render this lesson (no content).</p>`;
  }
  return compile(source, opts);
}

/**
 * Parse a lesson without rendering — e.g. to inspect diagnostics, or to
 * pull structured data (headings, @ref() targets) before render time.
 * @param {string} source
 * @returns {{ ast: object, errors: Error[], warnings: object[], diagnostics: object }}
 */
export function parseLesson(source) {
  return parse(source);
}

/**
 * Render an already-parsed AST (skips re-parsing if parseLesson() already ran).
 * @param {object} ast
 * @param {{ xhtml?: boolean, footnoteSection?: boolean }} [opts]
 * @returns {string} HTML
 */
export function renderLesson(ast, opts = {}) {
  return render(ast, opts);
}

/**
 * Interactive-document engine (@quiz, @mcq, @form, @deck, @poll, @tasks).
 * OpenKnowledge currently ships a separate, standalone MCQ engine
 * (../mcq-engine.js) that reads *mcq.json question banks, and no lesson
 * in this repo authors inline @quiz blocks yet — these pass straight
 * through to the real engine so they're available the moment a lesson
 * does use them, without another adapter change.
 */
export function parseLessonInteractive(source) {
  return parseInteractive(source);
}

export function renderLessonInteractive(nodes, opts = {}) {
  return renderInteractive(nodes, opts);
}

/**
 * Render one math expression (the content that would sit between $…$ or
 * inside @math…@/math — no delimiters) to the exact inline-math markup
 * real Zolto lesson content uses, so a "zolto" field on an MCQ question
 * (schemas/mcq.schema.json) looks identical to math written directly in
 * a lesson. Reuses the engine's own math subsystem (parseMath/
 * renderMathHTML/MATH_CSS) rather than a separate implementation, so any
 * syntax that works in a lesson works here too, with no drift between
 * the two.
 *
 * Never throws: malformed math renders as an inline error span (matching
 * how the real engine handles bad $…$ syntax inside a lesson), and empty/
 * whitespace-only/non-string input renders nothing at all — the caller
 * doesn't need to check q.zolto against "" itself before calling this.
 * @param {string} source
 * @returns {string} HTML, or "" if there's nothing to render
 */
export function renderInlineMath(source) {
  if (typeof source !== "string" || !source.trim()) return "";
  injectMathStylesOnce();
  const { ast, errors } = parseMath(source);
  if (!ast || errors?.length) {
    return `<span class="zl-merror" title="Math parse error">${escapeHtml(source)}</span>`;
  }
  const visual = renderMathHTML(ast);
  const mathml = renderMathML(ast, "inline");
  const ariaText = mathToPlainText(ast);
  return `<span class="zl-math zl-math-inline" role="img" aria-label="${escapeAttr(ariaText)}">${visual}<span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">${mathml}</span></span>`;
}

function injectMathStylesOnce() {
  if (typeof document === "undefined" || document.getElementById("zl-math-styles")) return;
  const style = document.createElement("style");
  style.id = "zl-math-styles";
  style.textContent = MATH_CSS;
  document.head.appendChild(style);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(text) {
  return escapeHtml(text);
}
