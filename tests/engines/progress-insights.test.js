import test from "node:test";
import assert from "node:assert/strict";
import {
  normSub, lessonHref, mcqHref, needsPractice, buildSubjectRows,
  learnedSubjectIds, learnedQuizHref, firstUnfinished, completedRecords,
} from "../../src/engines/progress-insights.js";

const recs = [
  { subjectId: "history", subSubjectId: "", lessonId: "a", completed: true, score: 0.4, lastStudied: "2026-10-02T10:00:00Z" },
  { subjectId: "science", subSubjectId: "physics", lessonId: "b", completed: true, score: 0.9, lastStudied: "2026-10-03T10:00:00Z" },
  { subjectId: "history", subSubjectId: "undefined", lessonId: "c", completed: false, score: 0.2, lastStudied: "2026-10-01T10:00:00Z" },
];

test("normSub treats stringified undefined as no sub-subject", () => {
  assert.equal(normSub("undefined"), "");
  assert.equal(normSub(undefined), "");
  assert.equal(normSub("physics"), "physics");
});

test("hrefs match the router patterns for flat and nested subjects", () => {
  assert.equal(lessonHref(recs[0]), "#/subjects/history/lessons/a");
  assert.equal(mcqHref(recs[1]), "#/subjects/science/physics/mcq/b");
});

test("needsPractice returns low scores, worst first", () => {
  assert.deepEqual(needsPractice(recs).map((r) => r.lessonId), ["c", "a"]);
});

test("subject rows rank by progress and never exceed 100%", () => {
  const rows = buildSubjectRows([
    { id: "history", title: "History", lessonCount: 4 },
    { id: "science", title: "Science", lessonCount: 1 },
    { id: "maths", title: "Maths", lessonCount: 9 },
  ], recs);
  assert.deepEqual(rows.map((r) => r.id), ["science", "history", "maths"]);
  assert.equal(rows[0].ratio, 1);
  assert.equal(rows[2].done, 0);
});

test("learnedSubjectIds is most-recent first and quiz link targets the custom runner", () => {
  assert.deepEqual(learnedSubjectIds(recs), ["science", "history"]);
  assert.equal(learnedQuizHref(["science", "history"]), "/mock-tests/custom?subjects=science%2Chistory&count=10&timed=0");
  assert.equal(learnedQuizHref([]), "/mock-tests");
});

test("firstUnfinished skips completed lessons", () => {
  assert.equal(firstUnfinished(["a", "x", "y"], "history", "", recs), "x");
  assert.equal(firstUnfinished(["a"], "history", "", recs), null);
  assert.equal(completedRecords(recs).length, 2);
});
