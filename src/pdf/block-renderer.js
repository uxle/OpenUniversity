// src/pdf/block-renderer.js — lays the lesson model onto A4 pages.
//
// Layout system: a 4 pt whitespace grid with fixed rhythm —
//   section gap 24 · block gap 8 · leading 1.45 · margins 56/64 —
// so negative space feels deliberate: never cramped, never airy.
// Every accent (chips, frames, option boxes, page numbers) is a rounded
// rectangle; nothing rasterises anywhere.

import {
  PAGE, SPACE, INK, RADIUS, TYPE, ADMONITION_KINDS, labelsFor,
} from "./pdf-theme.js";
import { registerStandardFonts, winAnsiByte, createSymbolExtraFont } from "./pdf-fonts.js";
import { escapeLiteral } from "./pdf-doc.js";
import { createGraphics } from "./pdf-graphics.js";
import {
  pushSegment, mathNodeToRuns, runsToCells, wrapCells,
  lineWidthPt, drawLine, drawParagraph, withVariant, setXtraFont,
} from "./pdf-text.js";
import { parseSvg, renderSvg } from "./svg-vector.js";
import { STD_FONT_WIDTHS } from "./data/standard-font-widths.js";

const STD_W = { helv: STD_FONT_WIDTHS.Helv, helvB: STD_FONT_WIDTHS.HelvB, helvI: STD_FONT_WIDTHS.HelvI };

function fmt(n) { return (Math.round(n * 100) / 100).toString(); }
function col(c) { return `${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])}`; }

/** Spans (lesson-model) → styled runs (pdf-text). */
export function spansToRuns(spans, base) {
  const runs = [];
  for (const span of spans || []) {
    if (span.math) {
      mathNodeToRuns(span.math, { ...base, font: "times" }, runs);
    } else if (span.code) {
      pushSegment(runs, span.text, { ...base, font: "courier", size: base.size * 0.94, color: [0.2, 0.24, 0.32] });
    } else if (span.text) {
      const variant = withVariant(base, { bold: !!span.bold, italic: !!span.italic });
      pushSegment(runs, span.text, variant);
    }
  }
  // trim leading/trailing space runs
  while (runs.length && /^\s+$/.test(runs[0].text || "")) runs.shift();
  while (runs.length && /^\s+$/.test(runs[runs.length - 1].text || "")) runs.pop();
  return runs;
}

/**
 * Creates the multi-page renderer.
 * @param {object} opts doc (pdf-doc), deva (devanagari runtime|null),
 *                      xtraTtfBytes (symbol-subset TrueType|null),
 *                      footer {brand} — drawn on every page.
 */
export function createLessonRenderer({ doc, deva = null, xtraTtfBytes = null, lang = "en", footer = { brand: "OpenKnowledge" } }) {
  const fontKeys = registerStandardFonts(doc);
  if (deva) fontKeys.deva = deva.resourceKey;
  let xtra = null;
  if (xtraTtfBytes) {
    xtra = createSymbolExtraFont(doc, xtraTtfBytes);
    fontKeys.xtra = xtra.resourceKey;
    setXtraFont(xtra); // pdf-text routes box-drawing/₹/₂/✓ glyphs here
  }

  let page = doc.addPage();
  let gfx = createGraphics(page, doc);
  let y = PAGE.marginTop;
  let pageNo = 1;
  const bottom = () => PAGE.height - PAGE.marginBottom;

  function finishPage() {
    drawFooter(gfx, pageNo);
  }

  function newPage() {
    finishPage();
    page = doc.addPage();
    gfx = createGraphics(page, doc);
    pageNo += 1;
    y = PAGE.marginTop;
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  const W = () => PAGE.contentWidth;

  function ensure(height) {
    if (y + height > bottom()) newPage();
  }

  function gap(h) {
    y += h;
  }

  function drawFooter(g, n) {
    const baseline = PAGE.height - 34; // top-down y of the footer baseline
    g.addOp(`BT /${fontKeys.helv} 7.8 Tf ${col(INK.faint)} rg ${fmt(PAGE.marginLeft)} ${fmt(PAGE.height - baseline)} Td (${escapeBrand(footer.brand)}) Tj ET`);
    // rounded page-number chip (never a circle)
    const chipW = 26, chipH = 14;
    const chipX = PAGE.width - PAGE.marginRight - chipW;
    const chipY = baseline - chipH + 3.5; // top-down, centred on the baseline
    g.save();
    g.roundedRect(chipX, chipY, chipW, chipH, RADIUS.chip);
    g.setStroke(INK.hairline);
    g.setLineWidth(0.7);
    g.stroke();
    g.restore();
    const numStr = String(n);
    const numW = (chipW - numStr.length * 1.2) / 2;
    g.addOp(`BT /${fontKeys.helv} 8.4 Tf ${col(INK.muted)} rg ${fmt(chipX + numW)} ${fmt(PAGE.height - baseline + 0.6)} Td (${numStr}) Tj ET`);
  }

  function escapeBrand(s) {
    // WinAnsi-safe literal text: unmap-able characters are dropped (never
    // truncated into stray bytes), PDF specials are escaped.
    let out = "";
    for (const ch of String(s)) {
      const b = winAnsiByte(ch.codePointAt(0));
      if (!b) continue;
      out += String.fromCharCode(b);
    }
    return escapeLiteral(out);
  }

  // ── public block drawing ─────────────────────────────────────────────────
  const R = {
    get pageNo() { return pageNo; },
    get y() { return y; },
    fontKeys,

    /** Lesson title block: subject pill, title, meta row, hairline. */
    drawTitleBlock({ model, minutes, dateLabel }) {
      const badge = [model.subjectTitle, model.subSubjectTitle].filter(Boolean).join("  ·  ").toUpperCase();
      const badgeSize = 7.6;
      const badgeW = measureText(badge, "helvB", badgeSize) + 18;
      ensure(46);
      gfx.save();
      gfx.roundedRect(PAGE.marginLeft, y, badgeW, 15, RADIUS.chip);
      gfx.setFill(INK.accentSoft);
      gfx.fill();
      gfx.restore();
      gfx.addOp(`BT /${fontKeys.helvB} ${badgeSize} Tf ${col(INK.accentInk)} rg ${fmt(PAGE.marginLeft + 9)} ${fmt(PAGE.height - (y + 10.4))} Td (${escapeBrand(badge)}) Tj ET`);
      y += 26;

      // Title (wrapped, 23 pt)
      const titleRuns = spansToRuns([{ text: model.title }], { font: "helvB", size: TYPE.title.size, color: INK.heading });
      y = drawRunsBlock(titleRuns, { size: TYPE.title.size, leading: TYPE.title.leading, maxWidth: W(), x: PAGE.marginLeft });
      y += 8;

      const labels = labelsFor(lang);
      const meta = [
        `${minutes} ${labels.minRead}`,
        dateLabel,
      ].filter(Boolean).join("   ·   ");
      drawTextLine(meta, PAGE.marginLeft, y + TYPE.meta.size, { font: "helv", size: TYPE.meta.size, color: INK.muted });
      y += TYPE.meta.leading + 14;
      gfx.hairline(PAGE.marginLeft, y, W(), INK.hairline, 0.8);
      y += SPACE.lg;
    },

    drawIntro(spans) {
      const runs = spansToRuns(spans, { font: "helvI", size: 10.6, leading: TYPE.body.leading, color: [0.28, 0.33, 0.41] });
      const cells = runsToCells(runs, { deva, fontKeys });
      const lines = wrapCells(cells, W() - 32);
      const h = lines.length * 15 + 26;
      ensure(h);
      gfx.drawRoundedRect(PAGE.marginLeft, y, W(), h, RADIUS.card, { fill: INK.panel2 });
      drawRunsIn(runs, { x: PAGE.marginLeft + 16, y: y + 13, maxWidth: W() - 32, leading: 15 });
      y += h + SPACE.lg;
    },

    /** Section heading + accent underline. */
    drawSectionHeading(spans, { first = false } = {}) {
      if (!first) ensure(SPACE.xl + 60);
      else ensure(60);
      if (!first) y += SPACE.xl - SPACE.sm;
      const runs = spansToRuns(spans, { font: "helvB", size: TYPE.h2.size, color: INK.heading });
      y = drawRunsBlock(runs, { size: TYPE.h2.size, leading: TYPE.h2.leading, maxWidth: W(), x: PAGE.marginLeft });
      y += 6;
      gfx.save();
      gfx.roundedRect(PAGE.marginLeft, y, 26, 2.6, 1.3);
      gfx.setFill(INK.accent);
      gfx.fill();
      gfx.restore();
      y += 11;
    },

    drawH3(spans) {
      ensure(48);
      y += SPACE.md;
      const runs = spansToRuns(spans, { font: "helvB", size: TYPE.h3.size, color: INK.heading });
      y = drawRunsBlock(runs, { size: TYPE.h3.size, leading: TYPE.h3.leading, maxWidth: W(), x: PAGE.marginLeft });
      y += SPACE.xs;
    },

    drawParagraph(spans, { color = INK.body, x = PAGE.marginLeft, width = W(), size = TYPE.body.size, leading = TYPE.body.leading } = {}) {
      const runs = spansToRuns(spans, { font: "helv", size, color });
      if (!runs.length) { y += leading * 0.4; return; }
      const est = estimateParagraphHeight(runs, width, leading);
      ensure(est);
      y = drawRunsBlock(runs, { size, leading, maxWidth: width, x });
      y += SPACE.sm;
    },

    drawQuote(spans) {
      const runs = spansToRuns(spans, { font: "helvI", size: 9.8, color: [0.28, 0.33, 0.41] });
      const cells = runsToCells(runs, { deva, fontKeys });
      const lines = wrapCells(cells, W() - 28);
      const h = lines.length * 14 + 20;
      ensure(h);
      gfx.drawRoundedRect(PAGE.marginLeft + 2, y, W() - 4, h, RADIUS.box, { fill: INK.panel });
      drawRunsIn(runs, { x: PAGE.marginLeft + 16, y: y + 10, maxWidth: W() - 32, leading: 14 });
      y += h + SPACE.sm;
    },

    drawList(block, { width = W(), x = PAGE.marginLeft } = {}) {
      let i = 0;
      for (const item of block.items) {
        const markerW = 15;
        const runs = spansToRuns(item.spans, { font: "helv", size: TYPE.body.size, color: INK.body });
        const est = estimateParagraphHeight(runs, width - markerW, TYPE.body.leading);
        ensure(est + 4);
        // marker: rounded square bullet / number chip
        if (block.ordered) {
          const label = `${i + 1}.`;
          gfx.addOp(`BT /${fontKeys.helvB} 9.4 Tf ${col(INK.accentInk)} rg ${fmt(x + 1)} ${fmt(PAGE.height - (y + 8.6))} Td (${escapeBrand(label)}) Tj ET`);
        } else if (item.checked === true) {
          gfx.drawRoundedRect(x + 1, y + 3, 9, 9, 2.6, { fill: INK.green.bar });
          drawCheck(gfx, x + 3.2, y + 7.5, 4.6, INK.white);
        } else if (item.checked === false) {
          gfx.drawRoundedRect(x + 1, y + 3, 9, 9, 2.6, { strokeColor: INK.hairline, lineWidth: 1 });
        } else {
          gfx.save();
          gfx.roundedRect(x + 2, y + 4.4, 4.4, 4.4, 1.4);
          gfx.setFill(item.nested ? INK.faint : INK.accent);
          gfx.fill();
          gfx.restore();
        }
        y = drawRunsBlock(runs, { size: TYPE.body.size, leading: TYPE.body.leading, maxWidth: width - markerW, x: x + markerW });
        y += item.nested ? 3 : 5;
        i += 1;
      }
      y += SPACE.xs - 4;
    },

    drawAdmonition(block, { width = W(), x = PAGE.marginLeft } = {}) {
      const kind = ADMONITION_KINDS[block.kind] || ADMONITION_KINDS.note;
      const innerX = x + 18;
      const innerW = width - 32;
      // measure inner height first (single page for admonitions — they are short)
      let innerH = 0;
      const probe = probeBlocks(block.blocks, innerW);
      innerH = probe.height;
      const label = (block.label || kind.label).toUpperCase();
      const h = 12 + 11 + innerH + 12;
      ensure(Math.min(h, 260));
      const startY = y;
      gfx.drawRoundedRect(x, startY, width, h, RADIUS.card, { fill: kind.tint.bg });
      // rounded accent bar on the left
      gfx.save();
      gfx.roundedRect(x, startY, 3.2, h, 1.6);
      gfx.setFill(kind.tint.bar);
      gfx.fill();
      gfx.restore();
      // icon badge: small rounded square with the label's first glyph
      gfx.drawRoundedRect(x + 13, startY + 12, 11, 11, 3.2, { fill: kind.tint.bar });
      const badgeChar = label.charAt(0);
      const badgeStyle = { font: "helvB", size: 8, color: INK.white };
      const badgeCharW = drawTextLine(badgeChar, 0, -1000, badgeStyle, { measureOnly: true });
      drawTextLine(badgeChar, x + 13 + (11 - badgeCharW) / 2, startY + 20.6, badgeStyle);
      drawTextLine(label, innerX + 17, startY + 21, { font: "helvB", size: 8.4, color: kind.tint.ink });

      const savedY = y;
      y = startY + 27;
      drawBlocks(block.blocks, { x: innerX + 17, width: innerW - 17, inAdmonition: true, inkColor: kind.tint.ink });
      y = startY + h;
      void savedY;
      y += SPACE.sm + 2;
    },

    drawMath(block, { width = W() } = {}) {
      const base = { font: "times", size: 11.4, color: INK.heading };
      const runs = [];
      mathNodeToRuns(block.ast, base, runs);
      if (!runs.length && block.content) pushSegment(runs, block.content, base);
      const cells = runsToCells(runs, { deva, fontKeys });
      const lines = wrapCells(cells, width - 48);
      const h = lines.length * 17 + 20;
      ensure(h);
      gfx.drawRoundedRect(PAGE.marginLeft + 18, y, width - 36, h, RADIUS.box, { fill: INK.panel });
      drawRunsIn(runs, { x: PAGE.marginLeft + 24, y: y + 10, maxWidth: width - 48, leading: 17, align: "center" });
      if (block.number != null) {
        const numStr = `(${block.number})`;
        gfx.addOp(`BT /${fontKeys.helv} 8.6 Tf ${col(INK.faint)} rg ${fmt(PAGE.marginLeft + width - 34)} ${fmt(PAGE.height - (y + 19))} Td (${escapeBrand(numStr)}) Tj ET`);
      }
      y += h + SPACE.sm;
    },

    drawCode(block, { width = W() } = {}) {
      // Cell pipeline (not raw Tj) so box-drawing art (─ │ ├ …) routes to
      // the embedded symbol font instead of being silently dropped.
      const style = { font: "courier", size: 8.6, color: [0.2, 0.24, 0.32] };
      const lines = String(block.text || "").replace(/\t/g, "  ").split("\n");
      const shown = lines.slice(0, 60);
      const innerW = width - 28;
      const h = shown.length * 12.6 + 20;
      ensure(h);
      gfx.drawRoundedRect(PAGE.marginLeft, y, width, h, RADIUS.box, { fill: INK.panel });
      let ly = y + 14;
      for (const line of shown) {
        if (line.trim()) {
          const runs = [];
          pushSegment(runs, line, style);
          const cells = runsToCells(runs, { deva, fontKeys });
          // truncate by measured width, never mid-glyph
          let acc = 0;
          const keep = [];
          for (const c of cells) {
            if (acc + c.width > innerW) break;
            acc += c.width;
            keep.push(c);
          }
          for (const c of keep) {
            if (c.style) c.style = { ...c.style, fontKey: fontKeys[c.style.font] || c.style.font };
          }
          drawLine(gfx, PAGE.marginLeft + 14, ly, keep, { deva, devaKey: fontKeys.deva });
        }
        ly += 12.6;
      }
      y += h + SPACE.sm;
    },

    drawHr() {
      ensure(18);
      gfx.hairline(PAGE.marginLeft + W() / 2 - 32, y + 4, 64, INK.hairline, 1);
      y += SPACE.md + 4;
    },

    drawTable(block, { width = W(), x = PAGE.marginLeft } = {}) {
      const padX = 8, padY = 6;
      const nCols = Math.max(
        block.head.length ? Math.max(...block.head.map((r) => r.length)) : 0,
        block.rows.length ? Math.max(...block.rows.map((r) => r.length)) : 1
      );
      if (!nCols) return;
      const availW = width - 2;
      const measureRow = (row) => row.map((cell) => spansToRuns(cell, { font: "helv", size: 9.4, color: INK.body }));
      const headRuns = block.head.map(measureRow);
      const bodyRuns = block.rows.map(measureRow);

      const colMin = new Array(nCols).fill(40);
      const colPref = new Array(nCols).fill(40);
      const scan = (rowRuns) => {
        rowRuns.forEach((cellRuns, ci) => {
          if (ci >= nCols) return;
          const cells = runsToCells(cellRuns, { deva, fontKeys });
          let maxWord = 0, total = 0;
          for (const cell of cells) {
            if (cell.t === "w") maxWord = Math.max(maxWord, cell.width);
            if (cell.t !== "br") total += cell.width;
          }
          colMin[ci] = Math.max(colMin[ci], Math.min(maxWord + padX * 2, availW * 0.6));
          colPref[ci] = Math.max(colPref[ci], Math.min(total + padX * 2, 250));
        });
      };
      headRuns.forEach(scan);
      bodyRuns.forEach(scan);

      // distribute width: mins first, then preference-weighted remainder
      let sumMin = colMin.reduce((a, b) => a + b, 0);
      const colW = [...colMin];
      if (sumMin < availW) {
        let leftover = availW - sumMin;
        const sumPref = colPref.reduce((a, b, i) => a + Math.max(0, b - colMin[i]), 0) || nCols;
        for (let i = 0; i < nCols; i++) {
          const want = Math.max(0, colPref[i] - colMin[i]);
          const add = sumPref ? (want / sumPref) * leftover : leftover / nCols;
          colW[i] += add;
        }
      } else {
        for (let i = 0; i < nCols; i++) colW[i] = (colMin[i] / sumMin) * availW;
      }

      const wrapRow = (rowRuns) => rowRuns.map((cellRuns, ci) => {
        const cells = runsToCells(cellRuns, { deva, fontKeys });
        return wrapCells(cells, colW[ci] - padX * 2);
      });

      // Row height = tallest cell's LINE count (cellLines.length = lines).
      const rowH = (rowWrapped) =>
        Math.max(1, ...rowWrapped.map((cellLines) => cellLines.length)) * 13 + 9;

      const headWrapped = headRuns.map(wrapRow);
      const bodyWrapped = bodyRuns.map(wrapRow);

      function drawTableFragment(headW, bodyW) {
        const headH = headW.length ? Math.max(...headW.map((rw) => rowH(rw))) : 0;
        const bodyH = bodyW.reduce((a, rw) => a + rowH(rw), 0);
        const totalH = headH + bodyH;
        gfx.save();
        // outer rounded frame clip (header band fills inside it)
        gfx.roundedRect(x, y, availW + 2, totalH + 2, RADIUS.box);
        gfx.clip();
        if (headH) {
          gfx.rect(x, y, availW + 2, headH);
          gfx.setFill(INK.accentSoft);
          gfx.fill();
        }
        gfx.restore();
        let ry = y;
        if (headH) {
          headW.forEach((rw) => {
            drawRowLines(rw, ry, INK.accentInk, "helvB", 9.4);
            ry += rowH(rw);
          });
        }
        bodyW.forEach((rw, ri) => {
          if (ri) gfx.hairline(x + 1, ry, availW, INK.hairline, 0.55);
          drawRowLines(rw, ry, INK.body, "helv", 9.4);
          ry += rowH(rw);
        });
        gfx.drawRoundedRect(x, y, availW + 2, totalH + 2, RADIUS.box, { strokeColor: INK.hairline, lineWidth: 0.9 });
        y += totalH + 2;
      }

      function drawRowLines(rowWrapped, ry, color, fontKey, size) {
        void fontKey; void size;
        let cx = x + 1;
        rowWrapped.forEach((cellLines, ci) => {
          let lineIdx = 0;
          for (const line of cellLines) {
            const baseline = ry + 10.5 + lineIdx * 13;
            if (line.length) drawLine(gfx, cx + padX, baseline, line, { color, deva, devaKey: fontKeys.deva });
            lineIdx += 1;
          }
          cx += colW[ci];
        });
      }

      // ── page-breakable loop ──
      let hi = 0;
      let ri = 0;
      while (true) {
        const fragBody = [];
        let est = headRuns.length ? 34 : 0;
        if (ri === 0 && headWrapped.length) est += Math.max(...headWrapped[0].map((cl) => cl.length)) * 13 + 14;
        ensure(est + 40);
        // measure how many rows fit
        let usedH = headRuns.length ? 30 : 2;
        if (ri === 0 && headWrapped.length) usedH += Math.max(...headWrapped[0].map((cl) => cl.length)) * 13 + 14;
        while (ri < bodyWrapped.length) {
          const rh = rowH(bodyWrapped[ri]);
          if (usedH + rh > bottom() - y && fragBody.length) break;
          fragBody.push(bodyWrapped[ri]);
          usedH += rh;
          ri += 1;
        }
        const fragHead = hi === 0 ? headWrapped : [];
        hi = 1;
        drawTableFragment(fragHead, fragBody);
        y += SPACE.sm;
        if (ri >= bodyWrapped.length) break;
        newPage();
      }
    },

    drawSvg(block) {
      let parsed;
      try {
        parsed = parseSvg(block.svg);
      } catch {
        return;
      }
      const vb = parsed.viewBox || { x: 0, y: 0, w: 800, h: 450 };
      const innerW = W() - 24;
      const SINGLE_MAX_H = 316;
      const SLICE_MAX_H = 380; // sliced panels may run taller (they replace a full-width fit)
      const TARGET_SCALE = 0.45; // ~14-unit diagram labels stay ≥ 6 pt

      // Ultra-wide art (big trees/timelines) fitted to page width would shrink
      // labels below legibility (e.g. 9354-unit timeline → 1.5 pt). Slice it
      // into stacked, overlapping full-width panels — still one vector source.
      // The cap is generous: a 9354×300 timeline needs ~10 panels to keep
      // labels ≥ 6 pt, reading like newspaper column rows.
      const singleScale = innerW / vb.w;
      let slices = 1;
      let scale = singleScale;
      if (singleScale < TARGET_SCALE && vb.h > 0) {
        slices = Math.min(12, Math.max(2, Math.ceil((vb.w * TARGET_SCALE) / innerW)));
        const sliceW = vb.w / slices;
        const overlap = Math.min(48, sliceW * 0.08);
        scale = innerW / (sliceW + 2 * overlap);
        const cappedH = scale * vb.h;
        if (cappedH > SLICE_MAX_H) scale = SLICE_MAX_H / vb.h;
      } else {
        const h0 = singleScale * vb.h;
        if (h0 > SINGLE_MAX_H) scale = SINGLE_MAX_H / vb.h;
      }

      const drawnH = scale * vb.h;
      const capStr = block.caption ? String(block.caption).slice(0, 110) : "";

      if (slices === 1) {
        const frameH = drawnH + 20;
        ensure(frameH + 26);
        const frameW = innerW + 20;
        const fx = PAGE.marginLeft + (W() - frameW) / 2;
        gfx.drawRoundedRect(fx, y, frameW, frameH, RADIUS.media, { fill: INK.white, strokeColor: INK.hairline, lineWidth: 0.9 });
        renderSvg(gfx, parsed, { x: fx + 10, y: y + 10, w: innerW, h: drawnH }, { fontKeys, deva });
        y += frameH;
      } else {
        const sliceW = vb.w / slices;
        const overlap = Math.min(48, sliceW * 0.08);
        const frameW = innerW + 20;
        for (let i = 0; i < slices; i++) {
          const cropX = Math.max(vb.x, vb.x + i * sliceW - overlap);
          const cropEnd = Math.min(vb.x + vb.w, vb.x + (i + 1) * sliceW + overlap);
          const crop = { x: cropX - vb.x, w: cropEnd - cropX };
          const frameH = drawnH + 20;
          ensure(frameH + 26);
          const fx = PAGE.marginLeft + (W() - frameW) / 2;
          gfx.drawRoundedRect(fx, y, frameW, frameH, RADIUS.media, { fill: INK.white, strokeColor: INK.hairline, lineWidth: 0.9 });
          renderSvg(gfx, parsed, { x: fx + 10, y: y + 10, w: innerW, h: drawnH }, { fontKeys, deva, crop });
          y += frameH + (i < slices - 1 ? SPACE.sm : 0);
        }
      }

      if (capStr) {
        ensure(16);
        // cell-pipeline caption (safe for Devanagari + symbols), centred
        const capRuns = [];
        pushSegment(capRuns, capStr, { font: "helvI", size: TYPE.caption.size, color: INK.faint });
        const capCells = runsToCells(capRuns, { deva, fontKeys });
        const capW = lineWidthPt(capCells.filter((c) => c.t !== "br"));
        drawTextLine(capStr, PAGE.marginLeft + Math.max(0, (W() - capW) / 2), y + 9, { font: "helvI", size: TYPE.caption.size, color: INK.faint });
        y += 16;
      }
      y += SPACE.sm;
    },

    finish() {
      finishPage();
    },

    /** Starts a fresh page (used to begin the practice/answer sections). */
    pageBreak() {
      newPage();
    },

    /** Exposes shared drawing internals for the MCQ renderer. */
    internals: {
      get fontKeys() { return fontKeys; },
      get deva() { return deva; },
      get gfx() { return gfx; },
      get y() { return y; },
      set y(v) { y = v; },
      ensure,
      measureText,
      escapeBrand,
      W,
      drawRunsBlock,
      drawRunsIn,
      drawTextLine,
      estimateParagraphHeight,
      spansToRuns,
      RADIUS, INK, TYPE, SPACE, PAGE,
    },
  };

  // ── shared internals ─────────────────────────────────────────────────────
  /**
   * Draws one line of arbitrary-script text through the cell pipeline
   * (WinAnsi + Symbol + shaped Devanagari). Returns the drawn width.
   */
  function drawTextLine(text, x, baselineY, style, { measureOnly = false } = {}) {
    const runs = [];
    pushSegment(runs, String(text || ""), style);
    const cells = runsToCells(runs, { deva, fontKeys });
    const visible = cells.filter((c) => c.t !== "br");
    if (!measureOnly) {
      drawLine(gfx, x, baselineY, visible, { deva, devaKey: fontKeys.deva });
    }
    return lineWidthPt(visible);
  }

  function measureText(text, font, size) {
    let w = 0;
    for (const ch of String(text)) {
      const cp = ch.codePointAt(0);
      const b = cp >= 32 && cp <= 126 ? cp : 32;
      w += (STD_W[font] || STD_W.helv)[b - 32] || 500;
    }
    return (w / 1000) * size;
  }

  function estimateParagraphHeight(runs, maxWidth, leading) {
    const cells = runsToCells(runs, { deva, fontKeys });
    const lines = wrapCells(cells, maxWidth);
    return lines.length * leading + 2;
  }

  function drawRunsIn(runs, { x, y: yy, maxWidth, leading, align = "left" }) {
    const cells = runsToCells(runs, { deva, fontKeys });
    for (const cell of cells) {
      cell.style = { ...cell.style, fontKey: fontKeys[cell.style.font] || cell.style.font };
    }
    const lines = wrapCells(cells, maxWidth);
    let cy = yy + leading * 0.82;
    for (const line of lines) {
      const w = lineWidthPt(line);
      let lx = x;
      if (align === "center") lx = x + Math.max(0, (maxWidth - w) / 2);
      else if (align === "right") lx = x + Math.max(0, maxWidth - w);
      drawLine(gfx, lx, cy, line, { deva, devaKey: fontKeys.deva });
      cy += leading;
    }
    return lines.length * leading;
  }

  function drawRunsBlock(runs, { size, leading, maxWidth, x }) {
    const endY = drawParagraph(gfx, x, y, runs, {
      size, leading, maxWidth, deva, fontKeys,
    });
    return endY;
  }

  function drawCheck(g, cx, cy, size, color) {
    g.save();
    g.setStroke(color);
    g.setLineWidth(1.4);
    g.setLineCap(1);
    g.setLineJoin(1);
    g.moveTo(cx, cy);
    g.lineTo(cx + size * 0.36, cy + size * 0.38);
    g.lineTo(cx + size, cy - size * 0.38);
    g.stroke();
    g.restore();
  }

  function probeBlocks(blocks, width) {
    // cheap height estimate for admonition innards (kept on one page)
    let h = 0;
    for (const block of blocks || []) {
      if (block.type === "paragraph" || block.type === "quote") {
        const runs = spansToRuns(block.spans, { font: "helv", size: 9.8, color: INK.body });
        h += estimateParagraphHeight(runs, width, 14) + 6;
      } else if (block.type === "list") {
        h += block.items.length * 19;
      } else if (block.type === "math") {
        h += 44;
      } else h += 20;
    }
    return { height: Math.max(h, 8) };
  }

  function drawBlocks(blocks, opts = {}) {
    for (const block of blocks || []) {
      switch (block.type) {
        case "paragraph":
          R.drawParagraph(block.spans, { color: opts.inkColor || INK.body, x: opts.x, width: opts.width });
          break;
        case "quote":
          R.drawQuote(block.spans);
          break;
        case "h3":
          R.drawH3(block.spans);
          break;
        case "list":
          R.drawList(block, { x: opts.x, width: opts.width });
          break;
        case "table":
          R.drawTable(block, { x: opts.x, width: opts.width });
          break;
        case "admonition":
          R.drawAdmonition(block, { x: opts.x, width: opts.width });
          break;
        case "math":
          R.drawMath(block, { width: opts.width });
          break;
        case "code":
          R.drawCode(block, { width: opts.width });
          break;
        case "svg":
          R.drawSvg(block);
          break;
        case "hr":
          R.drawHr();
          break;
        default:
          break;
      }
    }
  }

  R.drawBlocks = drawBlocks;
  return R;
}
