// src/engines/mock-test-engine.js — batch ("mock") test builder.
//
// A mock test is defined by a catalog entry (src/data/mock-tests.json)
// or built on the fly from query params (the "custom" batch test on the
// Mock Tests page). Each definition lists sections; each section points
// at a content scope — a subject (optionally narrowed to one
// sub-subject) — and a question count. The engine resolves the scope to
// its lesson list, samples a few RANDOM lesson question banks (so two
// attempts at the same test are never identical), and round-robins
// questions out of those banks so no single lesson dominates.
//
// Everything above buildTestRun() is pure and unit-tested (Node tests
// import this module with no DOM/fetch involved); the fetch-dependent
// runtime path lives below the fold.

import {
  getSubjectRegistry,
  getSubSubjectIndex,
  getLessonMcq,
} from "../services/content-service.js";
import { loadJSON } from "../core/loader.js";
import { config } from "../app/config.js";
import { isSafeContentSegment } from "../utils/ids.js";

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

/** Deterministic PRNG (mulberry32) so tests — and reproducible bug
 *  reports — can pin the sampling with a seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates on a copy; `rng` defaults to Math.random. */
export function shuffle(array, rng = Math.random) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How many lesson banks a section should fetch to fill `count`
 *  questions. Two banks minimum (variety), one bank per two questions
 *  after that — a 10-question section pulls from ~5 different lessons
 *  while keeping the fetch count small. */
export function sectionLessonBudget(count) {
  return Math.max(2, Math.ceil(count / 2));
}

/**
 * Round-robin `count` questions out of several banks (arrays of
 * question objects): one question per bank per pass, banks shuffled
 * inside first, result shuffled. Guarantees no bank contributes more
 * than one question per pass — i.e. at most ceil(count / banks)
 * questions from any single lesson.
 * @param {object[][]} banks
 * @param {number} count
 * @param {() => number} [rng]
 * @returns {object[]}
 */
export function sampleQuestions(banks, count, rng = Math.random) {
  const pools = banks
    .filter((bank) => Array.isArray(bank) && bank.length > 0)
    .map((bank) => shuffle(bank, rng));
  if (!pools.length || count <= 0) return [];

  const picked = [];
  let progressed = true;
  while (picked.length < count && progressed) {
    progressed = false;
    for (const pool of pools) {
      if (picked.length >= count) break;
      if (pool.length === 0) continue;
      picked.push(pool.pop());
      progressed = true;
    }
  }
  return shuffle(picked, rng);
}

/** Parse custom-test query params into a definition. Invalid subject
 *  ids are dropped; an empty result yields null (caller shows an empty
 *  state). `count` is distributed as evenly as possible across the
 *  chosen subjects. */
export function buildCustomDefinition(params, registrySubjects) {
  const requested = String(params.subjects || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isSafeContentSegment(s))
    .filter((id) => registrySubjects.some((s) => s.id === id));
  const unique = [...new Set(requested)];
  if (unique.length === 0) return null;

  const total = Math.min(Math.max(parseInt(params.count, 10) || 10, 5), 50);
  const perSection = Math.floor(total / unique.length);
  let remainder = total % unique.length;

  const sections = unique.map((id) => {
    const subject = registrySubjects.find((s) => s.id === id);
    let count = perSection + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    if (count < 1) count = 1;
    return { title: subject.title, subjectId: id, count };
  });

  // Redistribute any count lost to the min-1 clamp above.
  const allocated = sections.reduce((sum, s) => sum + s.count, 0);
  if (allocated < total) sections[0].count += total - allocated;

  const timed = params.timed === "1" || params.timed === "true";
  return {
    id: "custom",
    title: "Custom Batch Test",
    category: "Custom",
    description: "Your own subject mix, built from the whole question bank.",
    durationMinutes: timed ? Math.max(5, Math.ceil(total * 1.5)) : 0,
    sections,
  };
}

/** Score a finished attempt. `answers[i]` is the chosen option index
 *  for question i, or -1 when unanswered. Returns totals plus a
 *  per-section breakdown for the results table. */
export function summarizeAttempt(questions, answers) {
  const sections = [];
  const sectionIndex = new Map();
  let correct = 0;
  let answered = 0;

  questions.forEach((q, i) => {
    const choice = answers[i];
    // Defensive range check: the contract is "index or -1", but a stray
    // out-of-range value (hand-built links, storage tampering) must not
    // count as answered — and can never be correct anyway.
    const isAnswered = Number.isInteger(choice) && choice >= 0 && choice < q.options.length;
    const isCorrect = isAnswered && choice === q.correct;
    if (isAnswered) answered++;
    if (isCorrect) correct++;

    const title = q.sectionTitle || "Questions";
    if (!sectionIndex.has(title)) {
      sectionIndex.set(title, { title, count: 0, correct: 0 });
      sections.push(sectionIndex.get(title));
    }
    const section = sectionIndex.get(title);
    section.count++;
    if (isCorrect) section.correct++;
  });

  return {
    total: questions.length,
    answered,
    correct,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    sections,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime (fetch-dependent)                                           */
/* ------------------------------------------------------------------ */

export async function getMockTestCatalog() {
  return loadJSON(config.mockTestsPath);
}

export async function getMockTest(testId) {
  const catalog = await getMockTestCatalog();
  return (catalog.tests || []).find((t) => t.id === testId) || null;
}

/** All lesson refs in a section's scope: the subject's flat lessons
 *  plus every sub-subject's lessons, or just one sub-subject's when
 *  the section narrows the scope. */
async function resolveLessonPool(registry, section) {
  const subject = registry.subjects.find((s) => s.id === section.subjectId);
  if (!subject) return [];

  const refs = [];
  const add = (subSubjectId, lessonIds) => {
    lessonIds.forEach((lessonId) =>
      refs.push({ subjectId: subject.id, subSubjectId, lessonId }),
    );
  };

  if (section.subSubjectId) {
    const index = await getSubSubjectIndex(subject.id, section.subSubjectId).catch(() => null);
    add(section.subSubjectId, index?.lessons || []);
    return refs;
  }

  // Flat lessons live in the subject's own index.json; sub-subject
  // lessons in each sub's. Both shapes coexist (see content-service).
  const own = await getSubSubjectIndex(subject.id).catch(() => null);
  add(undefined, own?.lessons || []);
  for (const sub of subject.subSubjects || []) {
    const index = await getSubSubjectIndex(subject.id, sub.id).catch(() => null);
    add(sub.id, index?.lessons || []);
  }
  return refs;
}

/**
 * Materialise a definition into a runnable test: for each section,
 * resolve its lesson pool, sample a few banks, round-robin the
 * requested question count out of them, and tag every question with
 * its section title. Questions are renumbered 1..N.
 * @param {object} definition - a catalog entry or custom definition
 * @param {{ rng?: () => number }} [opts]
 * @returns {Promise<{ title, description, durationMinutes, sections: object[], questions: object[] }>}
 */
export async function buildTestRun(definition, { rng = Math.random } = {}) {
  const registry = await getSubjectRegistry();
  const questions = [];
  const sections = [];

  for (const section of definition.sections || []) {
    const pool = await resolveLessonPool(registry, section);
    if (!pool.length) continue;

    const budget = Math.min(pool.length, sectionLessonBudget(section.count));
    const chosen = shuffle(pool, rng).slice(0, budget);
    const banks = await Promise.all(
      chosen.map((ref) =>
        getLessonMcq(ref.subjectId, ref.subSubjectId, ref.lessonId)
          .then((result) => result?.data)
          .catch(() => null),
      ),
    );
    // Tag each question with the lesson it came from, so a wrong answer in
    // a mock can link straight back to the lesson that teaches it.
    const usable = banks
      .map((b, i) => (b && Array.isArray(b.questions) && b.questions.length
        ? b.questions.map((q) => ({ ...q, lessonRef: { ...chosen[i], title: String(b.title || "").replace(/:\s*Quiz$/i, "") } }))
        : null))
      .filter(Boolean);
    const picked = usable.length ? sampleQuestions(usable, section.count, rng) : [];
    if (!picked.length) continue;

    for (const q of picked) questions.push({ ...q, sectionTitle: section.title });
    sections.push({ title: section.title, count: picked.length });
  }

  if (!questions.length) {
    throw new Error("no questions could be loaded for this test");
  }
  return {
    title: definition.title,
    description: definition.description,
    durationMinutes: definition.durationMinutes || 0,
    sections,
    questions: questions.map((q, i) => ({ ...q, id: i + 1 })),
  };
}
