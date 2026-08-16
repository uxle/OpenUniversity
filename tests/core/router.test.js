// tests/core/router.test.js — the flat-subject routes (SUBJECT_LESSON,
// SUBJECT_MCQ) were added because some subjects (economics, geography,
// history, philosophy — see their src/subjects/*/index.json) have no
// subSubjects, and the UI previously had no way to reach their lessons at
// all (pages/subject.js only rendered subSubjects cards — see
// pages/subject.js's own comment). Reasoning used to be flat too but was
// later restructured into topic sub-subjects (clock/, blood-relation/,
// etc.), so "economics" is used below as the still-flat example. These
// tests lock in that the new patterns match the right shape and don't
// collide with the existing SUB_SUBJECT/LESSON/MCQ patterns, which share
// a URL prefix with them.
import test from "node:test";
import assert from "node:assert/strict";
import { createRouter } from "../../src/core/router.js";
import { ROUTES } from "../../src/app/constants.js";

function routerWithAllRoutes() {
  const router = createRouter();
  for (const pattern of Object.values(ROUTES)) {
    router.register(pattern, () => {});
  }
  return router;
}

test("SUBJECT_LESSON matches a flat subject's lesson URL with no subSubject segment", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/economics/lessons/lesson1");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "economics", lessonId: "lesson1" });
});

test("SUBJECT_MCQ matches a flat subject's quiz URL with no subSubject segment", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/economics/mcq/lesson1");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "economics", lessonId: "lesson1" });
});

test("LESSON (with subSubject) still matches its own 5-segment shape, not SUBJECT_LESSON", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/languages/hindi/lessons/varnmala");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "languages", subSubjectId: "hindi", lessonId: "varnmala" });
});

test("MCQ (with subSubject) still matches its own shape, not SUBJECT_MCQ", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/languages/hindi/mcq/varnmala");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "languages", subSubjectId: "hindi", lessonId: "varnmala" });
});

test("SUB_SUBJECT (3 segments) is not shadowed by the 4-segment flat routes", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/languages/hindi");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "languages", subSubjectId: "hindi" });
});

test("SUBJECT (2 segments) still matches a flat subject's own page", () => {
  const router = routerWithAllRoutes();
  const result = router.resolve("/subjects/economics");
  assert.ok(result, "expected a route match");
  assert.deepEqual(result.params, { subjectId: "economics" });
});
