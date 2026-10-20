// src/pdf/export-lesson-pdf.js — orchestrates the lesson-only PDF export.
//
// Pipeline: load lesson source + MCQ bank (current language) → build the
// junk-free document model → render vector pages → serialise → download.
// The button keeps the user informed via onProgress; failures surface as
// rejected promises (the button turns them into toasts).
//
// What the PDF contains: title block, intro, all lesson sections, tables,
// admonitions, display math, charts/diagrams (vector), then the full MCQ
// practice set and an answer key. What it never contains: quiz CTA, related
// lessons, notes, navigation, app chrome.

import { createPdfDoc } from "./pdf-doc.js";
import { createDevanagariFont } from "./pdf-fonts.js";
import { buildLessonModel, estimateReadingMinutes } from "./lesson-model.js";
import { createLessonRenderer } from "./block-renderer.js";
import { drawPracticeSection, drawAnswerKey } from "./mcq-renderer.js";
import { labelsFor } from "./pdf-theme.js";
import { loadLesson } from "../engines/lesson-engine.js";
import { getLessonMcq } from "../services/content-service.js";
import { getSubject } from "../engines/subject-engine.js";

const SHAPING_URL = "src/pdf/data/devanagari-shaping.json";
const DEVA_FONT_URL = "public/fonts/noto-devanagari-pdf-subset.ttf";
const SYMBOL_FONT_URL = "public/fonts/pdf-symbols-subset.ttf";
const DEVA_RE = /[\u0900-\u097f]/;

let devaRuntimePromise = null;
let symbolFontPromise = null;

/** Lazily loads the Devanagari shaping data + subset font (Hindi exports). */
export async function ensureDevanagari() {
  if (!devaRuntimePromise) {
    devaRuntimePromise = (async () => {
      const [shapingRes, fontRes] = await Promise.all([fetch(SHAPING_URL), fetch(DEVA_FONT_URL)]);
      if (!shapingRes.ok || !fontRes.ok) throw new Error("Devanagari PDF assets unavailable");
      const shaping = await shapingRes.json();
      const ttfBytes = new Uint8Array(await fontRes.arrayBuffer());
      return { shaping, ttfBytes };
    })().catch((err) => {
      devaRuntimePromise = null; // allow retry on a later export
      throw err;
    });
  }
  return devaRuntimePromise;
}

/** Lazily loads the symbol subset (box-drawing, ₹, ₂, ✓ — used by every export). */
export async function ensureSymbolFont() {
  if (!symbolFontPromise) {
    symbolFontPromise = (async () => {
      const res = await fetch(SYMBOL_FONT_URL);
      if (!res.ok) throw new Error("Symbol PDF font unavailable");
      return new Uint8Array(await res.arrayBuffer());
    })().catch((err) => {
      symbolFontPromise = null;
      throw err;
    });
  }
  return symbolFontPromise;
}

/** Test hook — injects shaping data without fetch (Node tests). */
export function __injectDevanagariRuntime(runtime) {
  devaRuntimePromise = Promise.resolve(runtime);
}

function slugify(text, fallback) {
  const slug = String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || fallback;
}

function todayLabel() {
  try {
    return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

async function extractSubjectTitles(subjectId, subSubjectId) {
  let subjectTitle = "";
  let subSubjectTitle = "";
  try {
    const subject = await getSubject(subjectId);
    subjectTitle = subject?.title || "";
    subSubjectTitle = subject?.subSubjects?.find((s) => s.id === subSubjectId)?.title || "";
  } catch {
    // breadcrumb is cosmetic — never block the export on it
  }
  return { subjectTitle, subSubjectTitle };
}

/**
 * Exports the current lesson as a vector PDF download.
 * @param {object} ctx {subjectId, subSubjectId, lessonId, lang}
 * @param {function} onProgress (stage: 'content'|'mcq'|'compose'|'save') => void
 * @returns {Promise<{bytes: Uint8Array, filename: string, pages: number}>}
 */
export async function exportLessonPdf(ctx, onProgress = () => {}) {
  const { subjectId, subSubjectId, lessonId, lang = "en" } = ctx;
  const report = (stage) => { try { onProgress(stage); } catch { /* ui hook */ } };

  report("content");
  const [lesson, titles] = await Promise.all([
    loadLesson(subjectId, subSubjectId, lessonId, lang),
    extractSubjectTitles(subjectId, subSubjectId),
  ]);

  report("mcq");
  const mcq = await getLessonMcq(subjectId, subSubjectId, lessonId, lesson.lang).catch(() => null);

  // Hindi needs the shaped Devanagari runtime — declared lang OR Devanagari
  // present in the source/MCQ text (a large share of the corpus is natively
  // Hindi under default file names).
  const mcqText = mcq ? JSON.stringify(mcq) : "";
  const needsDeva = lesson.lang === "hi" || DEVA_RE.test(lesson.source) || DEVA_RE.test(mcqText);

  let deva = null;
  if (needsDeva) {
    const { shaping, ttfBytes } = await ensureDevanagari();
    deva = { shaping, ttfBytes };
  }
  const xtraTtfBytes = await ensureSymbolFont();

  report("compose");
  const model = buildLessonModel({
    source: lesson.source,
    html: lesson.html,
    title: lesson.title,
    lang: lesson.lang,
    ...titles,
  });
  const minutes = estimateReadingMinutes(model);

  const doc = createPdfDoc({
    title: model.title,
    subject: `${titles.subjectTitle}${titles.subSubjectTitle ? " — " + titles.subSubjectTitle : ""}`.trim(),
    author: "OpenKnowledge",
  });

  let devaFont = null;
  if (deva) devaFont = createDevanagariFont(doc, deva);

  const renderer = createLessonRenderer({
    doc,
    deva: devaFont,
    xtraTtfBytes,
    lang: lesson.lang,
    footer: { brand: `OpenKnowledge${titles.subjectTitle ? "  ·  " + titles.subjectTitle : ""}` },
  });

  renderer.drawTitleBlock({ model, minutes, dateLabel: todayLabel() });
  if (model.intro) renderer.drawIntro(model.intro);

  model.sections.forEach((section, idx) => {
    renderer.drawSectionHeading(section.heading, { first: idx === 0 && !model.intro });
    renderer.drawBlocks(section.blocks);
  });

  const labels = labelsFor(lesson.lang);
  const hasMcq = mcq && drawPracticeSection(renderer, mcq, { labels });
  if (hasMcq) drawAnswerKey(renderer, mcq, { labels });

  renderer.finish();

  report("save");
  const { bytes } = await doc.finalize();
  const suffix = lesson.lang === "en" ? "" : `.${lesson.lang}`;
  const filename = `${slugify(model.title, lessonId)}${suffix}.pdf`;

  // Trigger the browser download (no-op data path under Node).
  if (typeof Blob === "function" && typeof document !== "undefined") {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return { bytes, filename, pages: countPages(bytes) };
}

/** Counts pages from the serialized file's /Pages object. */
function countPages(bytes) {
  let text = "";
  const limit = Math.min(bytes.length, 1 << 15);
  for (let i = 0; i < limit; i++) text += String.fromCharCode(bytes[i]);
  const m = text.match(/\/Count (\d+)/);
  if (m) return Number(m[1]);
  return 0;
}
