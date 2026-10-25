// src/utils/rich-text.js — Zolto in every quiz field (question, options,
// rationale), like the uxle/MCQs engine. Plain strings stay plain text
// (textContent, zero risk, zero cost); a string is compiled with the real
// Zolto engine only when it contains clear Zolto/Markdown constructs:
// $math$, `code`, **bold**, @directives, tables, or multi-line text.
// Zolto's compile() output is sanitized HTML (see lesson-content.js).
//
// The $…$ test follows pandoc's rules so currency never turns into math:
// the opening $ must not follow a letter/digit and must be followed by a
// non-space; the closing $ must follow a non-space and not precede a digit.
// ("US$12 billion, US$5", "$A$1", "$100 and $75,000" all stay plain.)
import { compileLesson, ensureMathStyles } from "../engines/zolto/zolto-engine.js";

const MATH = /(^|[^A-Za-z0-9$\\])\$(?=[^\s$])((?:[^$\n\\]|\\.)*?[^\s$\\])\$(?!\d)/;
const MATH_SHORT = /(^|[^A-Za-z0-9$\\])\$[^\s$]\$(?!\d)/;

export function looksLikeZolto(source) {
  if (typeof source !== "string") return false;
  return MATH.test(source) || MATH_SHORT.test(source)
    || /`[^`\n]+`/.test(source) || /\*\*[^*\n]+\*\*/.test(source)
    || /(^|\n)@[a-z]+/.test(source) || /(^|\n)\s*\|.+\|\s*\n\s*\|[\s:|-]+\|/.test(source)
    || /(^|\n)```/.test(source) || source.includes("\n");
}

const BLOCK = /<(?:div|table|ul|ol|pre|svg|h[1-6]|blockquote|figure|section)\b/i;

/** Returns sanitized HTML for Zolto source, or null when it is plain text. */
export function richHtml(source, { inline = false } = {}) {
  if (!looksLikeZolto(source)) return null;
  let html = compileLesson(source);
  if (html.includes('id="zl-math-styles"')) {
    ensureMathStyles();
    html = html.replace(/<style id="zl-math-styles">[\s\S]*?<\/style>/g, "");
  }
  html = html.trim();
  if (inline) {
    const m = /^<p>([\s\S]*)<\/p>$/.exec(html);
    if (m && !m[1].includes("</p>") && !BLOCK.test(m[1])) html = m[1];
  }
  return html;
}

/** Fill `el` with Zolto-rendered (or plain) content. Returns el. */
export function setRich(el, source, opts = {}) {
  const html = richHtml(source, opts);
  if (html === null) el.textContent = source ?? "";
  else { el.innerHTML = html; el.classList.add("ou-rich", "ou-lesson-content"); }
  return el;
}
