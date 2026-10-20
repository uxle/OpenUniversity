// src/pdf/mcq-renderer.js — appends the lesson's MCQ bank to the PDF as a
// proper practice section: question cards with rounded-rect option boxes
// (letter chips are rounded squares, never circles) followed by an answer
// key page with one-line rationales.

import { INK, RADIUS, TYPE, SPACE, PAGE } from "./pdf-theme.js";
import { drawParagraph } from "./pdf-text.js";
import { spansToRuns } from "./block-renderer.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function fmt(n) { return (Math.round(n * 100) / 100).toString(); }
function col(c) { return `${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])}`; }

function textRuns(R, text, base) {
  return spansToRuns([{ text: String(text || "") }], base);
}

/** Wraps + draws runs starting at block-top y; returns y after the block. */
function drawRunsAt(I, yTop, runs, { size, leading, maxWidth, x = PAGE.marginLeft, align = "left" }) {
  return drawParagraph(I.gfx, x, yTop, runs, {
    size, leading, maxWidth, align,
    deva: I.deva,
    fontKeys: I.fontKeys,
  });
}

function heightOf(I, runs, maxWidth, leading) {
  return I.estimateParagraphHeight(runs, maxWidth, leading);
}

function sectionHeader(I, y, badgeText, title, subtitleRuns) {
  const badge = String(badgeText).toUpperCase();
  const badgeTextW = I.drawTextLine(badge, 0, -1000, { font: "helvB", size: 7.6, color: INK.accentInk }, { measureOnly: true });
  const badgeW = badgeTextW + 18;
  I.gfx.drawRoundedRect(PAGE.marginLeft, y, badgeW, 15, RADIUS.chip, { fill: INK.accentSoft });
  I.drawTextLine(badge, PAGE.marginLeft + 9, y + 10.4, { font: "helvB", size: 7.6, color: INK.accentInk });
  y += 26;
  const titleRuns = textRuns(null, title, { font: "helvB", size: TYPE.h2.size + 2, color: INK.heading });
  y = drawRunsAt(I, y, titleRuns, { size: TYPE.h2.size + 2, leading: TYPE.h2.leading + 4, maxWidth: I.W() });
  if (subtitleRuns.length) {
    y += 5;
    y = drawRunsAt(I, y, subtitleRuns, { size: TYPE.small.size, leading: TYPE.small.leading, maxWidth: I.W() });
  }
  y += 7;
  I.gfx.hairline(PAGE.marginLeft, y, I.W(), INK.hairline, 0.8);
  return y + SPACE.lg;
}

function usableQuestions(mcq) {
  return (mcq?.questions || []).filter((q) => q && Array.isArray(q.options) && q.options.length >= 2);
}

/**
 * Draws the practice-questions section (starts on a fresh page).
 * @returns true if anything was drawn.
 */
export function drawPracticeSection(R, mcq, { labels } = {}) {
  const I = R.internals;
  const questions = usableQuestions(mcq);
  if (!questions.length) return false;

  R.pageBreak();
  let y = PAGE.marginTop;

  const subtitle = textRuns(null, `${questions.length} ${labels.questions}  ·  ${labels.practiceHint}`, {
    font: "helv", size: TYPE.small.size, color: INK.muted,
  });
  y = sectionHeader(I, y, labels.practiceBadge, labels.practice, subtitle);

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const chipH = 15;
    const textW = I.W() - chipH - 9;

    const qRuns = textRuns(null, q.question, { font: "helvB", size: 10.4, color: INK.heading });
    const qH = heightOf(I, qRuns, textW, 14.5);

    const optInnerW = I.W() - 14 - 8 - 22;
    const optRuns = q.options.map((opt) => textRuns(null, opt, { font: "helv", size: TYPE.option.size, color: INK.body }));
    const optHeightsList = optRuns.map((runs) => heightOf(I, runs, optInnerW, 13.4) + 13);

    const blockH = qH + 9 + optHeightsList.reduce((a, b) => a + b + 7, 0) + 12;
    if (y + blockH > PAGE.height - PAGE.marginBottom) {
      R.pageBreak();
      y = PAGE.marginTop;
    }

    // number chip — rounded square, accent fill, white numeral
    I.gfx.drawRoundedRect(PAGE.marginLeft, y, chipH, chipH, 4.5, { fill: INK.accent });
    const numStr = String(q.id ?? qi + 1);
    const numW = I.measureText(numStr, "helvB", 8.6);
    I.gfx.addOp(
      `BT /${I.fontKeys.helvB} 8.6 Tf ${col(INK.white)} rg ${fmt(PAGE.marginLeft + (chipH - numW) / 2)} ` +
      `${fmt(PAGE.height - (y + 10.8))} Td (${I.escapeBrand(numStr)}) Tj ET`
    );

    y = drawRunsAt(I, y - 2.5, qRuns, { size: 10.4, leading: 14.5, maxWidth: textW, x: PAGE.marginLeft + chipH + 9 });
    y += 8;

    for (let oi = 0; oi < q.options.length; oi++) {
      const oh = optHeightsList[oi];
      const ox = PAGE.marginLeft + 14;
      const ow = I.W() - 14;
      I.gfx.drawRoundedRect(ox, y, ow, oh, RADIUS.box, { fill: INK.panel, strokeColor: INK.hairline, lineWidth: 0.8 });
      const chW = 15;
      I.gfx.drawRoundedRect(ox + 7, y + (oh - chW) / 2, chW, chW, 4.2, { fill: INK.accentSoft });
      const letter = LETTERS[oi] || String(oi + 1);
      const lw = I.measureText(letter, "helvB", 8.4);
      I.gfx.addOp(
        `BT /${I.fontKeys.helvB} 8.4 Tf ${col(INK.accentInk)} rg ${fmt(ox + 7 + (chW - lw) / 2)} ` +
        `${fmt(PAGE.height - (y + (oh - chW) / 2 + 10.6))} Td (${letter}) Tj ET`
      );
      drawRunsAt(I, y + 6.5 - 2.5, optRuns[oi], {
        size: TYPE.option.size, leading: 13.4, maxWidth: optInnerW, x: ox + 7 + chW + 7,
      });
      y += oh + 7;
    }
    y += 6;
  }
  I.y = y;
  return true;
}

/**
 * Draws the answer key (always starts on its own page so the key never
 * spoils the questions while scrolling or printing double-sided).
 */
export function drawAnswerKey(R, mcq, { labels } = {}) {
  const I = R.internals;
  const questions = usableQuestions(mcq);
  if (!questions.length) return false;

  R.pageBreak();
  let y = PAGE.marginTop;
  y = sectionHeader(I, y, labels.answerBadge, labels.answerKey, []);

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const correctIdx = Math.min(Math.max(0, Number(q.correct) || 0), q.options.length - 1);
    const letter = LETTERS[correctIdx] || String(correctIdx + 1);
    const chipH = 15;
    const itemX = PAGE.marginLeft;
    const textX = itemX + chipH + 9;
    const textW = I.W() - chipH - 9;

    const optRuns = textRuns(null, `${letter}.  ${q.options[correctIdx]}`, { font: "helvB", size: 9.8, color: INK.heading });
    const optH = heightOf(I, optRuns, textW, 14);

    let rationaleRuns = [];
    let rationaleH = 0;
    if (q.rationale) {
      rationaleRuns = textRuns(null, q.rationale, { font: "helvI", size: TYPE.rationale.size, color: INK.muted });
      rationaleH = heightOf(I, rationaleRuns, textW, 12.6) + 3;
    }

    const blockH = Math.max(chipH, optH) + rationaleH + 10;
    if (y + blockH > PAGE.height - PAGE.marginBottom) {
      R.pageBreak();
      y = PAGE.marginTop;
    }

    I.gfx.drawRoundedRect(itemX, y, chipH, chipH, 4.5, { fill: INK.accent });
    const lw = I.measureText(letter, "helvB", 8.6);
    I.gfx.addOp(
      `BT /${I.fontKeys.helvB} 8.6 Tf ${col(INK.white)} rg ${fmt(itemX + (chipH - lw) / 2)} ` +
      `${fmt(PAGE.height - (y + 10.8))} Td (${letter}) Tj ET`
    );

    y = drawRunsAt(I, y - 2.5, optRuns, { size: 9.8, leading: 14, maxWidth: textW, x: textX }) + 2;
    if (rationaleRuns.length) {
      y = drawRunsAt(I, y, rationaleRuns, { size: TYPE.rationale.size, leading: 12.6, maxWidth: textW, x: textX });
    }
    y += 10;
  }
  I.y = y;
  return true;
}
