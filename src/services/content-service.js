// src/services/content-service.js — reads existing subject/lesson content
// at runtime (fetch). Does not author or modify .json/.zl files itself.

import { loadJSON, loadText } from "../core/loader.js";
import { config } from "../app/config.js";
import { DEFAULT_LESSON_LANGUAGE } from "../app/constants.js";

function subSubjectPath(subjectId, subSubjectId) {
  return subSubjectId
    ? `${config.dataBasePath}/${subjectId}/${subSubjectId}`
    : `${config.dataBasePath}/${subjectId}`;
}

export async function getSubjectRegistry() {
  return loadJSON(config.registryPath);
}

/** Fetches src/subjects/<subject>/details.zl as raw text (parsing is Zolto's job). */
export async function getSubjectDetailsSource(subjectId) {
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
  const base = subSubjectPath(subjectId, subSubjectId);
  if (lang && lang !== DEFAULT_LESSON_LANGUAGE) {
    try {
      const source = await loadText(`${base}/lessons/${lessonId}.${lang}.zl`);
      return { source, lang, isFallback: false };
    } catch {
      // No translation for this language yet — fall through to default.
    }
  }
  const source = await loadText(`${base}/lessons/${lessonId}.zl`);
  return { source, lang: DEFAULT_LESSON_LANGUAGE, isFallback: lang !== DEFAULT_LESSON_LANGUAGE };
}

/** Same fallback strategy as getLessonSource(), for the question bank. */
export async function getLessonMcq(subjectId, subSubjectId, lessonId, lang = DEFAULT_LESSON_LANGUAGE) {
  const base = subSubjectPath(subjectId, subSubjectId);
  if (lang && lang !== DEFAULT_LESSON_LANGUAGE) {
    try {
      const data = await loadJSON(`${base}/mcq/${lessonId}mcq.${lang}.json`);
      return { data, lang, isFallback: false };
    } catch {
      // fall through
    }
  }
  const data = await loadJSON(`${base}/mcq/${lessonId}mcq.json`);
  return { data, lang: DEFAULT_LESSON_LANGUAGE, isFallback: lang !== DEFAULT_LESSON_LANGUAGE };
}
