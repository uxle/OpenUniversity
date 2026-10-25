// src/engines/progress-insights.js — pure helpers that turn raw progress
// records into what the Progress page needs to be ACTIONABLE (what to
// revise, what to quiz on, where to continue). No DOM, no IndexedDB, so
// it is unit-tested in Node.

/** Flat subjects store sub-subject as "", undefined or a stringified
 *  undefined depending on the route that wrote the record. */
export function normSub(value) {
  return value && value !== "undefined" && value !== "null" ? String(value) : "";
}

export function titleKey(r) {
  return `${r.subjectId}::${normSub(r.subSubjectId)}::${r.lessonId}`;
}

export function lessonHref(r) {
  const sub = normSub(r.subSubjectId);
  return sub
    ? `#/subjects/${r.subjectId}/${sub}/lessons/${r.lessonId}`
    : `#/subjects/${r.subjectId}/lessons/${r.lessonId}`;
}

export function mcqHref(r) {
  const sub = normSub(r.subSubjectId);
  return sub
    ? `#/subjects/${r.subjectId}/${sub}/mcq/${r.lessonId}`
    : `#/subjects/${r.subjectId}/mcq/${r.lessonId}`;
}

/** Newest first; records that were never studied sink to the bottom. */
export function sortRecent(records) {
  return [...records].sort((a, b) => String(b.lastStudied || "").localeCompare(String(a.lastStudied || "")));
}

export function completedRecords(records) {
  return sortRecent(records.filter((r) => r.completed));
}

/** Lessons whose last quiz score is under the threshold, worst first. */
export function needsPractice(records, threshold = 0.6) {
  return records
    .filter((r) => typeof r.score === "number" && r.score < threshold)
    .sort((a, b) => a.score - b.score);
}

/** One row per subject: done / total + ratio, most-progressed first,
 *  untouched subjects last (alphabetical). */
export function buildSubjectRows(subjects, records) {
  const done = new Map();
  for (const r of records) if (r.completed) done.set(r.subjectId, (done.get(r.subjectId) || 0) + 1);
  return subjects
    .map((s) => {
      const total = s.lessonCount ?? 0;
      const d = Math.min(done.get(s.id) || 0, total || done.get(s.id) || 0);
      return { id: s.id, title: s.title, total, done: d, ratio: total ? d / total : 0 };
    })
    .sort((a, b) => (b.done - a.done) || (b.ratio - a.ratio) || a.title.localeCompare(b.title));
}

/** Subject ids the learner has finished at least one lesson in, most
 *  recently studied first — the pool for "quiz me on what I learned". */
export function learnedSubjectIds(records) {
  const seen = [];
  for (const r of completedRecords(records)) if (!seen.includes(r.subjectId)) seen.push(r.subjectId);
  return seen;
}

/** Link into the existing custom batch-test runner. Untimed by default
 *  — it is revision, not an exam. */
export function learnedQuizHref(subjectIds, count = 10) {
  if (!subjectIds.length) return "/mock-tests";
  const params = new URLSearchParams({ subjects: subjectIds.slice(0, 6).join(","), count: String(count), timed: "0" });
  return `/mock-tests/custom?${params.toString()}`;
}

/** First lesson in `lessonIds` the learner has not completed. */
export function firstUnfinished(lessonIds, subjectId, subSubjectId, records) {
  const done = new Set(records.filter((r) => r.completed && r.subjectId === subjectId && normSub(r.subSubjectId) === normSub(subSubjectId)).map((r) => r.lessonId));
  return lessonIds.find((id) => !done.has(id)) || null;
}

/** Lessons behind the questions a learner missed (wrong or skipped), most
 *  missed first, de-duplicated — the "go and learn this" list. */
export function lessonsToRevisit(questions, isMissed) {
  const map = new Map();
  questions.forEach((q, i) => {
    if (!q.lessonRef || !isMissed(i)) return;
    const r = q.lessonRef;
    const key = `${r.subjectId}::${normSub(r.subSubjectId)}::${r.lessonId}`;
    const e = map.get(key) || { ...r, href: lessonHref(r), missed: 0 };
    e.missed++;
    map.set(key, e);
  });
  return [...map.values()].sort((a, b) => b.missed - a.missed || String(a.title).localeCompare(String(b.title)));
}
