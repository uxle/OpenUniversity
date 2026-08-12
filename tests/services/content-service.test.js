// tests/services/content-service.test.js — guards against path traversal
// via route params (subjectId/subSubjectId/lessonId/lang all originate
// from the URL — see src/app/routes.js). Every content-service function
// should reject an unsafe segment *before* it ever reaches fetch(), so
// these tests only assert rejection (not a live network fetch, which
// isn't available in this test environment for relative URLs).
import test from "node:test";
import assert from "node:assert/strict";
import { isSafeContentSegment, isSafeLanguageCode } from "../../src/utils/ids.js";
import {
  getSubjectDetailsSource,
  getSubSubjectDetailsSource,
  getSubSubjectIndex,
  getLessonSource,
  getLessonMcq,
} from "../../src/services/content-service.js";

const TRAVERSAL_PAYLOADS = ["..", "../../etc/passwd", "..%2f..%2fapp", "a/b", "a%2fb", ""];

test("isSafeContentSegment rejects traversal/slash payloads, accepts plain slugs", () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    assert.equal(isSafeContentSegment(payload), false, `expected "${payload}" to be unsafe`);
  }
  for (const ok of ["mathematics", "algebra", "lesson1", "sources-of-the-constitution"]) {
    assert.equal(isSafeContentSegment(ok), true, `expected "${ok}" to be safe`);
  }
});

test("isSafeLanguageCode accepts known shapes, rejects traversal payloads", () => {
  for (const ok of ["en", "hi", "es"]) assert.equal(isSafeLanguageCode(ok), true);
  for (const payload of TRAVERSAL_PAYLOADS) {
    assert.equal(isSafeLanguageCode(payload), false, `expected "${payload}" to be unsafe`);
  }
});

test("getSubjectDetailsSource rejects path-traversal subjectId", async () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    await assert.rejects(() => getSubjectDetailsSource(payload));
  }
});

test("getSubSubjectDetailsSource rejects path-traversal ids", async () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    await assert.rejects(() => getSubSubjectDetailsSource(payload, "algebra"));
    await assert.rejects(() => getSubSubjectDetailsSource("mathematics", payload));
  }
});

test("getSubSubjectIndex rejects path-traversal ids", async () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    await assert.rejects(() => getSubSubjectIndex(payload, "algebra"));
  }
});

test("getLessonSource rejects path-traversal subjectId/lessonId", async () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    await assert.rejects(() => getLessonSource(payload, "algebra", "lesson1"));
    await assert.rejects(() => getLessonSource("mathematics", "algebra", payload));
  }
});

test("getLessonMcq rejects path-traversal subjectId/lessonId", async () => {
  for (const payload of TRAVERSAL_PAYLOADS) {
    await assert.rejects(() => getLessonMcq(payload, "algebra", "lesson1"));
    await assert.rejects(() => getLessonMcq("mathematics", "algebra", payload));
  }
});
