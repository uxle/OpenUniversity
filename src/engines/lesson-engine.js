// src/engines/lesson-engine.js — loads a lesson's Zolto source (in the
// requested language, falling back to the default) and compiles it to
// render-ready HTML via the real Zolto engine.

import { getLessonSource } from "../services/content-service.js";
import { compileLessonSource } from "../services/zolto-service.js";
import { DEFAULT_LESSON_LANGUAGE } from "../app/constants.js";

export async function loadLesson(subjectId, subSubjectId, lessonId, lang = DEFAULT_LESSON_LANGUAGE) {
  const { source, lang: servedLang, isFallback } = await getLessonSource(subjectId, subSubjectId, lessonId, lang);
  const html = await compileLessonSource(source);
  return {
    subjectId, subSubjectId, lessonId,
    source,
    html,
    title: extractTitle(source) || lessonId,
    lang: servedLang,
    requestedLang: lang,
    isFallback,
  };
}

function extractTitle(source) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}
