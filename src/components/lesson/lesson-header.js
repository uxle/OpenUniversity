// src/components/lesson/lesson-header.js — subject badge + title,
// matching the reference reader design.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

/**
 * Reading-time estimate from rendered lesson HTML. ~200 wpm for Latin
 * text; CJK/Devanagari scripts read at a slower character rate, so words
 * are counted script-aware (CJK ≈ 2 chars/"word", Devanagari uses space
 * words but longer ones — a 0.75 multiplier approximates the difference).
 */
export function estimateReadingMinutes(html) {
  if (!html) return 0;
  const text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  const latinWords = (text.match(/[A-Za-z0-9'’\-]+/g) || []).length;
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
  const devanagariWords = (text.match(/[\u0900-\u097f]+/g) || []).length;
  const minutes = (latinWords + devanagariWords * 0.75 + cjkChars / 2) / 200;
  return Math.max(1, Math.round(minutes));
}

export function createLessonHeader(lesson, subjectTitle) {
  const minutes = estimateReadingMinutes(lesson.html);
  return createEl("div", { class: "ou-lesson__meta" }, [
    subjectTitle ? createEl("span", { class: "ou-lesson-badge" }, [subjectTitle]) : null,
    createEl("h1", { class: "ou-reader-title" }, [lesson.title]),
    minutes ? createEl("div", { class: "ou-reading-time ou-text-sm ou-text-secondary" }, [
      icon("clock"),
      createEl("span", {}, [`${minutes} min read`]),
    ]) : null,
  ]);
}
