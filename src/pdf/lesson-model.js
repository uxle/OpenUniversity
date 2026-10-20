// src/pdf/lesson-model.js — converts a lesson (Zolto source + compiled HTML)
// into a flat, renderer-agnostic document model that contains ONLY lesson
// content: title, intro, sections, tables, admonitions, display math,
// charts/diagrams (as SVG strings) and lists.
//
// By construction it can never leak the app chrome the old print pipeline
// showed — quiz CTA, related lessons, notes panel, navigation — because
// those never exist in the AST. Practice questions are appended later from
// the MCQ bank (see mcq-renderer.js).

import { parse } from "../engines/zolto/vendor/zolto/zolto.js";

// Inline spans: {text, bold?, italic?, code?} | {math: astNode} | {br:true}
function inlineSpans(nodes, ctx = {}) {
  const out = [];
  for (const node of nodes || []) {
    switch (node?.type) {
      case "text":
        if (node.value) out.push({ text: node.value, bold: ctx.bold, italic: ctx.italic, code: ctx.code });
        break;
      case "softbreak":
        out.push({ text: " " });
        break;
      case "bold":
      case "strong":
        out.push(...inlineSpans(node.children, { ...ctx, bold: true }));
        break;
      case "italic":
      case "emphasis":
        out.push(...inlineSpans(node.children, { ...ctx, italic: true }));
        break;
      case "inline_code":
        if (node.value) out.push({ text: node.value, code: true });
        break;
      case "link":
      case "autolink":
        out.push(...inlineSpans(node.children, ctx));
        break;
      case "math_inline":
        if (node.ast) out.push({ math: node.ast });
        else if (node.content) out.push({ text: node.content });
        break;
      case "image":
        if (node.alt) out.push({ text: String(node.alt), italic: true });
        break;
      case "variable_ref":
        out.push({ text: String(node.name || "") });
        break;
      case "footnote_ref":
        break;
      default:
        if (node?.children?.length) out.push(...inlineSpans(node.children, ctx));
        else if (typeof node?.value === "string") out.push({ text: node.value });
        break;
    }
  }
  return out;
}

function spansToPlain(spans) {
  return (spans || [])
    .map((s) => (s.math ? "…" : s.text || ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

// Directive node types that render as SVG on screen.
const SVG_DIRECTIVE_TYPES = new Set(["chart", "diagram", "vector", "layout", "animation", "component"]);

/** Collects machine-generated <svg>…</svg> blocks in document order. */
function extractSvgs(html) {
  const svgs = [];
  const re = /<svg\b[\s\S]*?<\/svg>/g;
  let m;
  while ((m = re.exec(html))) svgs.push(m[0]);
  return svgs;
}

function mapBlock(node, svgs, svgIndex, out) {
  switch (node?.type) {
    case "paragraph": {
      const spans = inlineSpans(node.children);
      if (spansToPlain(spans) || spans.length) out.push({ type: "paragraph", spans });
      return;
    }
    case "heading": {
      if (node.level >= 3) out.push({ type: "h3", spans: inlineSpans(node.children) });
      return; // h1/h2 handled by the section walker
    }
    case "blockquote": {
      const spans = [];
      for (const child of node.children || []) {
        if (child.type === "paragraph") spans.push(...inlineSpans(child.children));
      }
      if (spans.length) out.push({ type: "quote", spans });
      return;
    }
    case "table": {
      const cellSpans = (cell) => (cell?.type === "table_cell" ? inlineSpans(cell.children) : []);
      const head = (node.head || []).map((row) => (row.cells || []).map(cellSpans));
      const rows = (node.rows || []).map((row) => (row.cells || []).map(cellSpans));
      out.push({ type: "table", head, rows, align: node.align || [] });
      return;
    }
    case "list": {
      const items = [];
      const itemNodes = node.items || node.children || [];
      for (const item of itemNodes) {
        if (item?.type !== "list_item") {
          // tolerate flat structures where the list's children are inline
          if (item?.type === "paragraph" || item?.type === "text") {
            items.push({ spans: item.type === "text" ? [{ text: item.value }] : inlineSpans(item.children), checked: null });
          }
          continue;
        }
        const spans = [];
        let nested = null;
        for (const child of item.children || []) {
          if (child.type === "list") nested = child;
          else if (child.type === "paragraph") spans.push(...inlineSpans(child.children));
          else if (child.type === "text") spans.push({ text: child.value });
          else {
            const mapped = [];
            mapBlock(child, svgs, svgIndex, mapped);
            for (const m of mapped) {
              if (m.type === "paragraph") spans.push(...m.spans);
              else spans.push({ text: spansToPlain(m.spans || []) });
            }
          }
        }
        items.push({ spans, checked: item.checked ?? null });
        if (nested) {
          // one nesting level; deeper levels flatten into it
          for (const deep of nested.items || nested.children || []) {
            const deepSpans = [];
            for (const child of deep.children || []) {
              if (child.type === "paragraph") deepSpans.push(...inlineSpans(child.children));
              else if (child.type === "text") deepSpans.push({ text: child.value });
            }
            items.push({ spans: deepSpans, checked: deep.checked ?? null, nested: true });
          }
        }
      }
      out.push({ type: "list", ordered: !!node.ordered, items });
      return;
    }
    case "admonition": {
      const blocks = [];
      for (const child of node.children || []) mapBlock(child, svgs, svgIndex, blocks);
      out.push({
        type: "admonition",
        kind: node.admonType || "note",
        label: node.title || null,
        blocks,
      });
      return;
    }
    case "math_block":
      out.push({ type: "math", ast: node.ast, content: node.content || "", number: node.number ?? null });
      return;
    case "code_block":
    case "code":
      out.push({ type: "code", text: String(node.value ?? node.text ?? node.content ?? "") });
      return;
    case "horizontal_rule":
    case "thematic_break":
      out.push({ type: "hr" });
      return;
    default: {
      if (SVG_DIRECTIVE_TYPES.has(node?.type)) {
        const svg = svgs[svgIndex.i] || null;
        svgIndex.i += 1;
        if (svg) {
          out.push({ type: "svg", svg, caption: node.title || node.aria || null, svgType: node.type });
        }
        return;
      }
      // Unknown container — recurse so nothing silently disappears.
      if (node?.children?.length) {
        for (const child of node.children) mapBlock(child, svgs, svgIndex, out);
      }
      return;
    }
  }
}

/**
 * @param {object} input
 *   source    raw .zl source
 *   html      compiled HTML (used only to harvest rendered SVGs)
 *   title     lesson title (from loadLesson)
 *   lang      "en" | "hi" | …
 *   subjectTitle / subSubjectTitle — breadcrumb text for the header + footer
 */
export function buildLessonModel({ source, html = "", title, lang = "en", subjectTitle = "", subSubjectTitle = "" }) {
  const { ast } = parse(source);
  const svgs = extractSvgs(html);
  const svgIndex = { i: 0 };

  const model = {
    title: title || "",
    lang,
    subjectTitle,
    subSubjectTitle,
    intro: null,
    lead: [],
    sections: [],
  };

  let current = null;
  const ensureSection = () => {
    if (!current) {
      current = { heading: [], blocks: [] };
      model.sections.push(current);
    }
    return current;
  };

  for (const node of ast.children || []) {
    if (node.type === "heading" && node.level === 1) {
      if (!model.title) model.title = spansToPlain(inlineSpans(node.children));
      continue;
    }
    if (node.type === "heading" && node.level === 2) {
      current = { heading: inlineSpans(node.children), blocks: [] };
      model.sections.push(current);
      continue;
    }
    if (node.type === "blockquote" && !model.intro && !current) {
      const spans = [];
      for (const child of node.children || []) {
        if (child.type === "paragraph") spans.push(...inlineSpans(child.children));
      }
      model.intro = spans.length ? spans : null;
      continue;
    }
    if (node.type === "front_matter" || node.type === "yaml") continue;
    const blocks = [];
    mapBlock(node, svgs, svgIndex, blocks);
    if (blocks.length) ensureSection().blocks.push(...blocks);
  }

  return model;
}

/** Rough reading-time estimate for the meta line. */
export function estimateReadingMinutes(model) {
  let words = 0;
  const count = (spans) => {
    for (const s of spans || []) if (s.text) words += s.text.split(/\s+/).filter(Boolean).length;
  };
  count(model.intro);
  for (const section of model.sections) {
    count(section.heading);
    for (const block of section.blocks) {
      if (block.type === "paragraph" || block.type === "quote") count(block.spans);
      else if (block.type === "list") for (const item of block.items) count(item.spans);
      else if (block.type === "table") {
        for (const row of [...block.head, ...block.rows]) for (const cell of row) count(cell);
      } else if (block.type === "admonition") {
        for (const inner of block.blocks) if (inner.type === "paragraph") count(inner.spans);
      } else if (block.type === "code") {
        words += (block.text || "").split(/\s+/).filter(Boolean).length;
      }
    }
  }
  return Math.max(1, Math.round(words / 190));
}
