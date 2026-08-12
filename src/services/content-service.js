// src/services/content-service.js — reads existing subject/lesson content
// at runtime (fetch). Does not author or modify .json/.zl files itself.

import { loadJSON, loadText } from "../core/loader.js";
import { config } from "../app/config.js";
import { DEFAULT_LESSON_LANGUAGE } from "../app/constants.js";
import { isSafeContentSegment, isSafeLanguageCode } from "../utils/ids.js";

// subjectId/subSubjectId/lessonId ultimately come from the URL (router
// params) — see src/app/routes.js and src/pages/lesson.js. Every path this
// module builds is a fetch() target, so any of those values must be
// verified as a plain slug (no "/", "..", "%2f", etc.) before it's
// concatenated in, or a crafted link could make this app fetch same-origin
// resources outside src/subjects/ (path traversal). Fail loudly and early
// rather than letting an unchecked value reach fetch().
function assertSafeSegment(value, label) {
  if (!isSafeContentSegment(value)) {
    throw new Error(`Invalid ${label}: "${value}"`);
  }
  return value;
}

function subSubjectPath(subjectId, subSubjectId) {
  assertSafeSegment(subjectId, "subjectId");
  if (subSubjectId) assertSafeSegment(subSubjectId, "subSubjectId");
  return subSubjectId
    ? `${config.dataBasePath}/${subjectId}/${subSubjectId}`
    : `${config.dataBasePath}/${subjectId}`;
}

export async function getSubjectRegistry() {
  return loadJSON(config.registryPath);
}

/** Fetches src/subjects/<subject>/details.zl as raw text (parsing is Zolto's job). */
export async function getSubjectDetailsSource(subjectId) {
  assertSafeSegment(subjectId, "subjectId");
  return loadText(`${config.dataBasePath}/${subjectId}/details.zl`);
}

export async function getSubSubjectDetailsSource(subjectId, subSubjectId) {
  return loadText(`${subSubjectPath(subjectId, subSubjectId)}/details.zl`);
}

export async function getSubSubjectIndex(subjectId, subSubjectId) {
  return loadJSON(`${subSubjectPath(subjectId, subSubjectId)}/index.json`);
}

/**
 * Loads a lesson's Zolto source, preferring a translated file
 * (`lessonId.<lang>.zl`, per the naming convention documented in the
 * README's Internationalization section) and falling back to the default
 * (`lessonId.zl`) if no translation exists yet for that language.
 * @returns {Promise<{ source: string, lang: string, isFallback: boolean }>}
 */
export async function getLessonSource(subjectId, subSubjectId, lessonId, lang = DEFAULT_LESSON_LANGUAGE) {
  assertSafeSegment(lessonId, "lessonId");
  const base = subSubjectPath(subjectId, subSubjectId);
  // An unrecognized lang falls back below rather than throwing — only
  // reject shapes that could break out of the path, matching the
  // existing "unknown translation -> fall through to default" behavior.
  const safeLang = isSafeLanguageCode(lang) ? lang : DEFAULT_LESSON_LANGUAGE;
  if (safeLang && safeLang !== DEFAULT_LESSON_LANGUAGE) {
    try {
      const source = await loadText(`${base}/lessons/${lessonId}.${safeLang}.zl`);
      return { source, lang: safeLang, isFallback: false };
    } catch {
      // No translation for this language yet — fall through to default.
    }
  }
  const source = await loadText(`${base}/lessons/${lessonId}.zl`);
  return { source, lang: DEFAULT_LESSON_LANGUAGE, isFallback: safeLang !== DEFAULT_LESSON_LANGUAGE };
}

/** Same fallback strategy as getLessonSource(), for the question bank. */
export async function getLessonMcq(subjectId, subSubjectId, lessonId, lang = DEFAULT_LESSON_LANGUAGE) {
  assertSafeSegment(lessonId, "lessonId");
  const base = subSubjectPath(subjectId, subSubjectId);
  const safeLang = isSafeLanguageCode(lang) ? lang : DEFAULT_LESSON_LANGUAGE;
  if (safeLang && safeLang !== DEFAULT_LESSON_LANGUAGE) {
    try {
      const data = await loadJSON(`${base}/mcq/${lessonId}mcq.${safeLang}.json`);
      return { data, lang: safeLang, isFallback: false };
    } catch {
      // fall through
    }
  }
  const data = await loadJSON(`${base}/mcq/${lessonId}mcq.json`);
  return { data, lang: DEFAULT_LESSON_LANGUAGE, isFallback: safeLang !== DEFAULT_LESSON_LANGUAGE };
}
