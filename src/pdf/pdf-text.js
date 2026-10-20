// src/pdf/pdf-text.js — the text engine for the lesson PDF.
//
// Responsibilities:
//   1. Turn styled inline runs (from the Zolto AST) into measurable "cells".
//   2. Segment text by script: WinAnsi Latin → standard-14 vector text,
//      math glyphs (√, π, ≤…) → Symbol font, Devanagari → the embedded
//      shaped TrueType font (glyph IDs from build-time HarfBuzz shaping).
//   3. Typeset math expressions as runs with true superscript/subscript
//      rises (fraction → a/b, sqrt → √(…), greek via Symbol).
//   4. Greedy word wrapping + line drawing.
//
// Everything is vector: no image path exists in this engine.

import { escapeLiteral } from "./pdf-doc.js";
import { winAnsiByte, symbolByte, stdWidth, symbolWidth } from "./pdf-fonts.js";

const DEVA_START = 0x0900, DEVA_END = 0x097f;

// ── Extra symbol font (module runtime) ──────────────────────────────────────
// Box-drawing art, ₹, sub/superscript digits, ✓/✗ and arrows the standard-14
// fonts cannot show are drawn from a tiny embedded TrueType subset
// (public/fonts/pdf-symbols-subset.ttf, built by tools/build-pdf-symbols.py).
// The runtime is registered once per export before any layout happens, so
// every text path (paragraphs, tables, code, SVG labels, MCQs) picks it up
// without threading another parameter through the whole pipeline.

let XTRA = null;

/** Registers the embedded symbol-font runtime (see createSymbolExtraFont). */
export function setXtraFont(rt) {
  XTRA = rt;
}

export function getXtraFont() {
  return XTRA;
}

/** Font-variant transitions for bold/italic decorations. */
export function withVariant(style, { bold = false, italic = false, mono = false } = {}) {
  if (mono) return { ...style, font: "courier", size: style.size * 0.92 };
  if (bold && italic) {
    return { ...style, font: style.font.startsWith("times") ? "timesBI" : "helvBI" };
  }
  if (bold) return { ...style, font: style.font === "helv" ? "helvB" : style.font === "times" ? "timesB" : style.font };
  if (italic) return { ...style, font: style.font === "helv" ? "helvI" : style.font === "times" ? "timesI" : style.font };
  return style;
}

// ── Math → styled runs ───────────────────────────────────────────────────────
// Renders the Zolto math AST with real typography: identifiers italic,
// numbers upright, greek/operators via the Symbol font, ^ and _ as true
// super/subscript runs with raised/lowered baselines.

function needsParens(node) {
  if (!node) return false;
  return node.type === "BinaryExpression" || node.type === "Sequence";
}

export function mathNodeToRuns(node, base, out = []) {
  if (!node) return out;
  const serif = { ...base, font: base.font === "times" ? "times" : "times" };
  switch (node.type) {
    case "Equation":
      for (const c of node.children || []) mathNodeToRuns(c, base, out);
      return out;
    case "Sequence":
      (node.children || []).forEach((c, i) => {
        if (i) out.push({ text: ",  ", style: serif });
        mathNodeToRuns(c, base, out);
      });
      return out;
    case "BinaryExpression": {
      const kids = node.children || [];
      if (node.op == null) {
        // implicit multiplication — thin space, no dot (textbook style)
        kids.forEach((c, i) => {
          if (i && (c.type !== "Delim") && (kids[i - 1].type !== "Delim")) out.push({ text: "\u00a0", style: serif });
          mathNodeToRuns(c, base, out);
        });
      } else {
        kids.forEach((c, i) => {
          if (i) out.push({ text: ` ${node.op} `, style: serif });
          mathNodeToRuns(c, base, out);
        });
      }
      return out;
    }
    case "UnaryExpression": {
      const isMinus = node.op === "-" || node.op === "\u2212";
      out.push({ text: isMinus ? "\u2212" : String(node.op), style: serif });
      for (const c of node.children || []) mathNodeToRuns(c, base, out);
      return out;
    }
    case "Identifier": {
      const name = String(node.name || "");
      // Multi-letter identifiers that are functions stay upright.
      if (/^(sin|cos|tan|log|ln|max|min|gcd|lcm|det|mod|sgn|sec|csc|cot)$/.test(name)) {
        out.push({ text: name, style: { ...serif, font: "times" } });
      } else {
        out.push({ text: name, style: { ...serif, font: "timesI" } });
      }
      return out;
    }
    case "Number":
      out.push({ text: String(node.value), style: serif });
      return out;
    case "Power": {
      const kids = node.children || [];
      const supStyle = { ...serif, size: serif.size * 0.66, rise: serif.size * 0.4 };
      mathNodeToRuns(kids[0], base, out);
      if (kids[1]) mathNodeToRuns(kids[1], supStyle, out);
      return out;
    }
    case "Subscript": {
      const kids = node.children || [];
      const subStyle = { ...serif, size: serif.size * 0.66, rise: -serif.size * 0.16 };
      mathNodeToRuns(kids[0], base, out);
      if (kids[1]) mathNodeToRuns(kids[1], subStyle, out);
      return out;
    }
    case "Fraction": {
      const kids = node.children || [];
      const [num, den] = kids;
      const complexNum = needsParens(num), complexDen = needsParens(den);
      if (complexNum) out.push({ text: "(", style: serif });
      mathNodeToRuns(num, base, out);
      if (complexNum) out.push({ text: ")", style: serif });
      out.push({ text: "/", style: serif });
      if (complexDen) out.push({ text: "(", style: serif });
      mathNodeToRuns(den, base, out);
      if (complexDen) out.push({ text: ")", style: serif });
      return out;
    }
    case "Root": {
      const kids = node.children || [];
      const index = node.index ?? (kids.length > 1 ? kids[0] : null);
      const body = kids.length > 1 ? kids[1] : kids[0];
      if (index) {
        mathNodeToRuns(index, { ...serif, size: serif.size * 0.66, rise: serif.size * 0.4 }, out);
      }
      out.push({ text: "\u221a", style: { ...serif, font: "times" } }); // Symbol-fallback handles the glyph
      out.push({ text: "(", style: serif });
      mathNodeToRuns(body, base, out);
      out.push({ text: ")", style: serif });
      return out;
    }
    case "Delim": {
      const open = node.open || "(", close = node.close || ")";
      out.push({ text: open, style: serif });
      for (const c of node.children || []) mathNodeToRuns(c, base, out);
      out.push({ text: close, style: serif });
      return out;
    }
    case "Operator":
      out.push({ text: String(node.op || ","), style: serif });
      return out;
    case "Symbol":
      // unicode is attached by the parser (α, ∞, …); script segmentation
      // routes non-WinAnsi codepoints into the Symbol font automatically.
      out.push({ text: node.unicode || node.command || "", style: serif });
      return out;
    case "Summation": {
      out.push({ text: "\u2211", style: { ...serif, font: "times" } });
      const kids = node.children || [];
      if (kids.length > 1) mathNodeToRuns(kids[0], { ...serif, size: serif.size * 0.62, rise: -serif.size * 0.2 }, out);
      if (kids.length > 2) mathNodeToRuns(kids[1], { ...serif, size: serif.size * 0.62, rise: serif.size * 0.42 }, out);
      return out;
    }
    case "Limit": {
      out.push({ text: String(node.fnName || "lim"), style: serif });
      const kids = node.children || [];
      if (kids.length) mathNodeToRuns(kids[0], { ...serif, size: serif.size * 0.66, rise: -serif.size * 0.16 }, out);
      return out;
    }
    case "Space":
      out.push({ text: "\u00a0", style: serif });
      return out;
    case "Text":
      out.push({ text: String(node.text || ""), style: { ...base, font: "helv" } });
      return out;
    default: {
      // Unknown node — fall back to its plain text so nothing disappears.
      if (typeof node.value === "string") out.push({ text: node.value, style: serif });
      else for (const c of node.children || []) mathNodeToRuns(c, base, out);
      return out;
    }
  }
}

// ── Inline AST → styled runs ─────────────────────────────────────────────────

export function inlineNodesToRuns(nodes, base) {
  const out = [];
  for (const node of nodes || []) {
    switch (node?.type) {
      case "text":
        pushSegment(out, node.value || "", base);
        break;
      case "softbreak":
        out.push({ text: " ", style: base });
        break;
      case "bold":
        out.push(...inlineNodesToRuns(node.children, withVariant(base, { bold: true })));
        break;
      case "italic":
        out.push(...inlineNodesToRuns(node.children, withVariant(base, { italic: true })));
        break;
      case "strong":
        out.push(...inlineNodesToRuns(node.children, withVariant(base, { bold: true })));
        break;
      case "emphasis":
        out.push(...inlineNodesToRuns(node.children, withVariant(base, { italic: true })));
        break;
      case "inline_code":
        pushSegment(out, node.value || "", withVariant(base, { mono: true }));
        break;
      case "link":
      case "autolink":
        out.push(...inlineNodesToRuns(node.children, base));
        break;
      case "math_inline":
      case "math_block":
        if (node.ast) mathNodeToRuns(node.ast, { ...base, font: "times" }, out);
        else pushSegment(out, node.content || "", base);
        break;
      case "variable_ref":
        out.push({ text: String(node.name || ""), style: base });
        break;
      case "image":
        if (node.alt) out.push({ text: String(node.alt), style: withVariant(base, { italic: true }) });
        break;
      case "footnote_ref":
        break; // footnote bodies are app-level extras, not lesson content
      default:
        if (node?.children?.length) out.push(...inlineNodesToRuns(node.children, base));
        else if (typeof node?.value === "string") pushSegment(out, node.value, base);
        break;
    }
  }
  return out;
}

// ── Script segmentation: text → runs tagged per font ─────────────────────────

/** Attaches the page's font resource key to a style (no-op if unknown). */
function withKey(style, fontKeys) {
  return fontKeys && style ? { ...style, fontKey: fontKeys[style.font] || style.font } : style;
}

function classify(cp) {
  if (winAnsiByte(cp)) return "std";
  if (cp >= DEVA_START && cp <= DEVA_END) return "deva";
  if (symbolByte(cp)) return "sym";
  if (XTRA && XTRA.has(cp)) return "xtra";
  return "drop";
}

/** Splits styled text into per-script runs (merging adjacent same-kind). */
export function pushSegment(out, text, style) {
  if (!text) return;
  let buffer = "";
  let currentKind = null;
  const flush = () => {
    if (buffer && currentKind) {
      if (currentKind !== "drop") out.push({ text: buffer, style, kind: currentKind });
    }
    buffer = "";
  };
  for (const ch of String(text)) {
    const cp = ch.codePointAt(0);
    // keep ZWJ/ZWNJ inside Devanagari runs (shaping keys rely on them)
    if ((cp === 0x200c || cp === 0x200d) && currentKind === "deva") {
      buffer += ch;
      continue;
    }
    const kind = classify(cp);
    if (kind !== currentKind) {
      flush();
      currentKind = kind;
    }
    buffer += ch;
  }
  flush();
}

// ── Cells (atomic layout units) ──────────────────────────────────────────────

function runWidthPt(run) {
  let w = 0;
  for (const ch of run.text) {
    const cp = ch.codePointAt(0);
    const byte = winAnsiByte(cp);
    if (byte) w += stdWidth(byte, run.style.font);
    else if (symbolByte(cp)) w += symbolWidth(symbolByte(cp));
    else if (cp >= DEVA_START && cp <= DEVA_END) w += 500; // crude; real width comes from shaping
  }
  return (w / 1000) * run.style.size;
}

function devaTokenWidthPt(glyphs, deva, size) {
  let adv = 0, minDx = 0;
  for (const g of glyphs) {
    adv += g[3] || 0;
    minDx = Math.min(minDx, g[1] || 0);
  }
  return Math.max((adv / deva.upem) * size, 0);
}

/**
 * Converts styled runs into word/space/break cells.
 * kind 'deva' runs are tokenised on whitespace and shaped via the
 * build-time shaping tables (word → cluster → char fallbacks).
 */
export function runsToCells(runs, { deva = null, forcedBreaks = true, fontKeys = null } = {}) {
  const cells = [];
  for (const run of runs) {
    const style = run.style;
    if (run.kind === "deva") {
      // Devanagari run — shape per whitespace-separated token.
      const tokens = String(run.text).split(/(\s+)/);
      for (const token of tokens) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          const spaceAdv = deva?.space ? deva.space[3] : 260;
          cells.push({ t: "s", deva: true, width: (spaceAdv / (deva?.upem || 1000)) * style.size, style: withKey(style, fontKeys) });
          continue;
        }
        let glyphs = deva?.lookupWord(token) || null;
        if (!glyphs) {
          // cluster-splitting fallback: shape each Devanagari cluster
          // separately; a cluster missing from the table falls back to
          // per-character cmap lookup (readable, conjuncts approximate).
          glyphs = [];
          let matched = true;
          for (const cluster of splitDevaClusters(token)) {
            const shaped = deva?.lookupCluster(cluster) || null;
            if (shaped) {
              glyphs.push(...shaped);
            } else {
              for (const ch of cluster) {
                const single = deva?.lookupChar(ch.codePointAt(0));
                if (single) glyphs.push(...single);
                else { matched = false; break; }
              }
            }
            if (!matched) break;
          }
          if (!matched) glyphs = null;
        }
        if (glyphs && glyphs.length && deva) {
          cells.push({ t: "w", kind: "deva", glyphs, width: devaTokenWidthPt(glyphs, deva, style.size), style: withKey(style, fontKeys) });
        } else {
          // No shaping available — render codepoints directly (readable,
          // though conjuncts/matras may be typographically imperfect).
          cells.push({ t: "w", kind: "devaRaw", text: token, width: runWidthPt({ ...run, text: token }), style: withKey(style, fontKeys) });
        }
      }
      continue;
    }

    if (run.kind === "xtra") {
      // Embedded symbol font — one glyph cell per codepoint.
      for (const ch of String(run.text)) {
        const g = XTRA ? XTRA.lookup(ch.codePointAt(0)) : null;
        if (!g) continue;
        cells.push({
          t: "w", kind: "xtra", glyph: g,
          width: (g[3] / XTRA.upem) * style.size,
          style: withKey({ ...style, font: "xtra" }, fontKeys),
        });
      }
      continue;
    }

    // Latin / mixed runs — split on spaces, honor softbreak.
    const parts = String(run.text).split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (part === "\n" && forcedBreaks) { cells.push({ t: "br" }); continue; }
      if (/^\s+$/.test(part)) { cells.push({ t: "s", width: (stdWidth(32, style.font) / 1000) * style.size, style: withKey(style, fontKeys) }); continue; }
      cells.push(...textToCell(part, style, fontKeys));
    }
  }
  return cells;
}

/** One unbreakable Latin/mixed word → a single cell (std/sym/xtra mixed → per-char ops). */
function textToCell(text, style, fontKeys) {
  // Fast path: pure WinAnsi (the overwhelming case).
  let pure = true;
  for (const ch of text) {
    if (!winAnsiByte(ch.codePointAt(0))) { pure = false; break; }
  }
  if (pure) {
    return [{ t: "w", kind: "std", text, width: (measureWinAnsi(text, style.font) / 1000) * style.size, style: withKey(style, fontKeys) }];
  }
  // Mixed: split into per-font sub-cells so Symbol/extra glyphs switch fonts.
  const cells = [];
  let buf = "", bufKind = null;
  const flush = () => {
    if (!buf) return;
    if (bufKind === "sym") {
      const byte = symbolByte(buf.codePointAt(0));
      cells.push({ t: "w", kind: "sym", byte, width: (symbolWidth(byte) / 1000) * style.size, style: withKey({ ...style, font: "symbol" }, fontKeys) });
    } else if (bufKind === "xtra") {
      const g = XTRA ? XTRA.lookup(buf.codePointAt(0)) : null;
      if (g) cells.push({ t: "w", kind: "xtra", glyph: g, width: (g[3] / XTRA.upem) * style.size, style: withKey({ ...style, font: "xtra" }, fontKeys) });
    } else {
      cells.push({ t: "w", kind: "std", text: buf, width: (measureWinAnsi(buf, style.font) / 1000) * style.size, style: withKey(style, fontKeys) });
    }
    buf = "";
  };
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const kind = winAnsiByte(cp) ? "std"
      : symbolByte(cp) ? "sym"
      : XTRA && XTRA.has(cp) ? "xtra"
      : "std";
    if (kind !== bufKind || (bufKind && bufKind !== "std")) { flush(); bufKind = kind; }
    buf += ch;
  }
  flush();
  return cells;
}

export function measureWinAnsi(text, font) {
  let w = 0;
  for (const ch of String(text)) w += stdWidth(winAnsiByte(ch.codePointAt(0)), font);
  return w;
}

/**
 * Splits a Devanagari token into clusters: consonant + (nukta) + matras*,
 * or consonant + virama + consonant chains, with leading independent
 * vowels/marks kept with the following consonant.
 */
export function splitDevaClusters(token) {
  const out = [];
  let cur = "";
  let pendingVirama = false;
  for (const ch of token) {
    const cp = ch.codePointAt(0);
    const isConsonant = (cp >= 0x0915 && cp <= 0x0939) || (cp >= 0x0958 && cp <= 0x095f) || (cp >= 0x0978 && cp <= 0x097f);
    const isMatra = (cp >= 0x093e && cp <= 0x094c) || cp === 0x0945 || cp === 0x0946 || cp === 0x0949 || cp === 0x094a || cp === 0x094b || cp === 0x094e;
    const isVirama = cp === 0x094d;
    const isMark = cp === 0x0901 || cp === 0x0902 || cp === 0x0903 || cp === 0x093c || cp === 0x0951 || cp === 0x0952;
    const isIndependent = (cp >= 0x0904 && cp <= 0x0914) || cp === 0x0972 || cp === 0x0973 || cp === 0x0974 || cp === 0x0975 || cp === 0x0976 || cp === 0x0977 || cp === 0x0979 || cp === 0x097a || cp === 0x097b || cp === 0x097c || cp === 0x097e || cp === 0x097f;
    const isDigit = cp >= 0x0966 && cp <= 0x096f;

    if (isVirama) { cur += ch; pendingVirama = true; continue; }
    if (pendingVirama) {
      // virama + consonant → same cluster (conjunct)
      cur += ch;
      pendingVirama = false;
      continue;
    }
    if (isConsonant || isIndependent || isDigit) {
      if (cur) out.push(cur);
      cur = ch;
      continue;
    }
    if (isMatra || isMark) {
      if (!cur) { out.push(ch); continue; }
      cur += ch;
      continue;
    }
    // anything else (punctuation, latin digits) — own cluster
    if (cur) { out.push(cur); cur = ""; }
    out.push(ch);
  }
  if (cur) out.push(cur);
  return out;
}

// ── Wrapping ─────────────────────────────────────────────────────────────────

/** Greedy word wrap → array of lines (arrays of cells). */
export function wrapCells(cells, maxWidth) {
  const lines = [];
  let line = [];
  let lineW = 0;

  for (const cell of cells) {
    if (cell.t === "br") {
      lines.push(line);
      line = [];
      lineW = 0;
      continue;
    }
    if (cell.t === "s") {
      if (line.length) {
        line.push(cell);
        lineW += cell.width; // spaces count toward the measured line width
      }
      continue;
    }
    // word cell
    if (line.length && lineW + cell.width > maxWidth) {
      // drop trailing spaces of the finished line
      while (line.length && line[line.length - 1].t === "s") line.pop();
      lines.push(line);
      line = [cell];
      lineW = cell.width;
    } else {
      line.push(cell);
      lineW += cell.width;
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

export function lineWidthPt(line) {
  let w = 0;
  for (const cell of line) {
    if (cell.t === "br") continue;
    w += cell.width;
  }
  return w;
}

/** Total height of a wrapped paragraph. */
export function measureParagraph(runs, { size, maxWidth, leading, deva }) {
  const cells = runsToCells(runs, { deva });
  const lines = wrapCells(cells, maxWidth);
  return lines.length * leading;
}

// ── Drawing ──────────────────────────────────────────────────────────────────

function fmt(n) { return (Math.round(n * 100) / 100).toString(); }
function col(c) { return `${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])}`; }

function colorOf(style, fallback) {
  return style?.color || fallback || [0.118, 0.161, 0.231];
}

/**
 * Draws one line of cells at baseline y (top-down coords).
 * Returns the x cursor after the line.
 */
export function drawLine(gfx, x, y, line, {
  color = null,
  deva = null,
  devaKey = null,
} = {}) {
  let cursor = x;
  for (const cell of line) {
    if (cell.t === "br") continue;
    const style = cell.style;
    const size = style.size;
    const rise = style.rise || 0;
    const baseline = y - rise; // top-down: positive rise lifts text
    const ink = colorOf(style, color);
    if (cell.t === "s") {
      // Emit a real space glyph between shaped Devanagari words so text
      // extraction keeps word boundaries (visual advance is unchanged).
      if (cell.deva && deva && deva.space) {
        const s = size / deva.upem;
        const g = deva.space;
        gfx.addOp(`BT /${devaKey || style.fontKey} ${fmt(size)} Tf ${col(ink)} rg 1 0 0 1 ${fmt(cursor)} ${fmt(gfx.page.height - baseline)} Tm <${(g[0] | 0).toString(16).padStart(4, "0")}> Tj ET`);
      }
      cursor += cell.width;
      continue;
    }

    if (cell.kind === "std") {
      gfx.addOp(`BT /${style.fontKey} ${fmt(size)} Tf ${col(ink)} rg ${fmt(cursor)} ${fmt(gfx.page.height - baseline)} Td (${escapeLiteral(toWinAnsiBytes(cell.text))}) Tj ET`);
      cursor += cell.width;
    } else if (cell.kind === "sym") {
      gfx.addOp(`BT /${style.fontKey} ${fmt(size)} Tf ${col(ink)} rg ${fmt(cursor)} ${fmt(gfx.page.height - baseline)} Td (${escapeLiteral(String.fromCharCode(cell.byte))}) Tj ET`);
      cursor += cell.width;
    } else if (cell.kind === "xtra") {
      // Embedded symbol font — positioned glyph by GID (Type0/Identity-H).
      const g = cell.glyph;
      const xrt = XTRA;
      const s = xrt ? size / xrt.upem : size / 1000;
      gfx.addOp(`BT /${style.fontKey} ${fmt(size)} Tf ${col(ink)} rg 1 0 0 1 ${fmt(cursor + (g[1] || 0) * s)} ${fmt(gfx.page.height - (baseline + (g[2] || 0) * s))} Tm <${(g[0] | 0).toString(16).padStart(4, "0")}> Tj ET`);
      cursor += cell.width;
    } else if (cell.kind === "deva" && deva) {
      const s = size / deva.upem;
      let penX = cursor;
      gfx.addOp(`BT /${devaKey || style.fontKey} ${fmt(size)} Tf ${col(ink)} rg`);
      for (const g of cell.glyphs) {
        const gid = g[0] | 0;
        const gx = g[1] || 0, gy = g[2] || 0, adv = g[3] || 0;
        const gxPt = penX + gx * s;
        const gyPt = gfx.page.height - (baseline + gy * s);
        gfx.addOp(`1 0 0 1 ${fmt(gxPt)} ${fmt(gyPt)} Tm <${gid.toString(16).padStart(4, "0")}> Tj`);
        penX += adv * s;
      }
      gfx.addOp("ET");
      cursor += cell.width;
    } else if (cell.kind === "devaRaw") {
      // Unshaped fallback: draw each codepoint from the embedded font cmap.
      const s = size / (deva ? deva.upem : 1000);
      let penX = cursor;
      gfx.addOp(`BT /${devaKey || style.fontKey} ${fmt(size)} Tf ${col(ink)} rg`);
      for (const ch of cell.text) {
        const glyphs = deva?.lookupChar(ch.codePointAt(0));
        if (!glyphs) continue;
        const g = glyphs[0];
        gfx.addOp(`1 0 0 1 ${fmt(penX + (g[1] || 0) * s)} ${fmt(gfx.page.height - (baseline + (g[2] || 0) * s))} Tm <${(g[0] | 0).toString(16).padStart(4, "0")}> Tj`);
        penX += (g[3] || 0) * s;
      }
      gfx.addOp("ET");
      cursor += cell.width;
    }
  }
  return cursor;
}

function toWinAnsiBytes(text) {
  let out = "";
  for (const ch of String(text)) out += String.fromCharCode(winAnsiByte(ch.codePointAt(0)));
  return out;
}

/**
 * Draws a wrapped paragraph; returns the y cursor BELOW the block
 * (top-down coordinates). `fontKeyOf(styleKey)` maps style keys to the
 * page's registered PDF font resource names.
 */
export function drawParagraph(gfx, x, y, runs, {
  size, leading, maxWidth,
  align = "left",
  color = null,
  deva = null,
  fontKeys = null,
  skipFirstLine = 0,
}) {
  const cells = runsToCells(runs, { deva });
  // Attach resource keys + resolve deva font style markers.
  for (const cell of cells) {
    if (cell.style) {
      cell.style = { ...cell.style, fontKey: fontKeys ? fontKeys[cell.style.font] : cell.style.font };
    }
  }
  const lines = wrapCells(cells, maxWidth);
  let cy = y + leading * 0.82; // first baseline: cap-height optical position
  for (let i = skipFirstLine; i < lines.length; i++) {
    const line = lines[i];
    const w = lineWidthPt(line);
    let lx = x;
    if (align === "center") lx = x + Math.max(0, (maxWidth - w) / 2);
    else if (align === "right") lx = x + Math.max(0, maxWidth - w);
    drawLine(gfx, lx, cy, line, { color, deva, devaKey: fontKeys ? fontKeys.deva : null });
    cy += leading;
  }
  // Block occupies exactly n leading steps from y — the next block starts
  // there, giving every paragraph a consistent, calibrated bottom edge.
  return y + lines.length * leading;
}
