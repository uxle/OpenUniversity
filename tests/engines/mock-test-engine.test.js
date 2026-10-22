// tests/engines/mock-test-engine.test.js — covers the PURE half of
// src/engines/mock-test-engine.js (everything above buildTestRun, which
// the header comment promises is import-safe without a DOM/fetch). The
// runtime half is exercised by browser smoke tests instead, matching how
// mcq-engine.test.js treats the boundary.
import test from "node:test";
import assert from "node:assert/strict";
import {
  mulberry32,
  shuffle,
  sectionLessonBudget,
  sampleQuestions,
  buildCustomDefinition,
  summarizeAttempt,
} from "../../src/engines/mock-test-engine.js";

const bank = (n) => Array.from({ length: n }, (_, i) => ({ id: i }));

/* ---------------------------------------------------------------- */

test("mulberry32 is deterministic for a given seed", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a(), a(), a()];
  const seqB = [b(), b(), b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

test("shuffle returns a permutation without mutating the input", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const rng = mulberry32(7);
  const out = shuffle(input, rng);
  assert.notEqual(input, out);
  assert.deepEqual([...out].sort((a, b) => a - b), input);
  assert.equal(input.length, 8); // original untouched
});

test("sectionLessonBudget: two banks minimum, one per two questions after", () => {
  assert.equal(sectionLessonBudget(1), 2);
  assert.equal(sectionLessonBudget(2), 2);
  assert.equal(sectionLessonBudget(10), 5);
  assert.equal(sectionLessonBudget(11), 6);
});

test("sampleQuestions round-robins: no bank beats ceil(count/banks)", () => {
  const banks = [bank(10), bank(10), bank(10), bank(10)];
  const picked = sampleQuestions(banks, 10, mulberry32(3));
  assert.equal(picked.length, 10);
  // 4 banks × 10 questions: max per bank is ceil(10/4) = 3.
  const perBank = new Map();
  for (const q of picked) perBank.set(q.id, (perBank.get(q.id) || 0) + 1);
  assert.ok(Math.max(...perBank.values()) <= 3);
});

test("sampleQuestions skips empty banks and never duplicates a question", () => {
  const picked = sampleQuestions([[], bank(5), null, bank(5)], 8, mulberry32(9));
  // Only 10 real questions exist, all 8 asks must be unique objects.
  assert.equal(picked.length, 8);
  assert.equal(new Set(picked).size, 8);
});

test("sampleQuestions with nothing usable returns an empty array", () => {
  assert.deepEqual(sampleQuestions([], 5), []);
  assert.deepEqual(sampleQuestions([[], []], 5, mulberry32(1)), []);
  assert.deepEqual(sampleQuestions([bank(5)], 0), []);
});

test("sampleQuestions falls short gracefully when banks run dry", () => {
  const picked = sampleQuestions([bank(3), bank(2)], 10, mulberry32(5));
  assert.equal(picked.length, 5); // everything available, nothing duplicated
});

/* ---------------------------------------------------------------- */

const REGISTRY = [
  { id: "mathematics", title: "Mathematics" },
  { id: "reasoning", title: "Reasoning" },
  { id: "history", title: "History" },
];

test("buildCustomDefinition distributes the count across chosen subjects", () => {
  const def = buildCustomDefinition(
    { subjects: "history,mathematics", count: "15", timed: "1" },
    REGISTRY,
  );
  assert.equal(def.id, "custom");
  assert.equal(def.sections.length, 2);
  assert.equal(def.sections.reduce((s, x) => s + x.count, 0), 15);
  // 15 / 2 subjects → 8 + 7 (remainder to the earlier subject)
  assert.deepEqual(def.sections.map((s) => s.count), [8, 7]);
  assert.equal(def.durationMinutes, 23); // ceil(15 * 1.5)
});

test("buildCustomDefinition drops unknown/unsafe subjects and duplicates", () => {
  const def = buildCustomDefinition(
    { subjects: "mathematics,physics,../etc,mathematics", count: "10" },
    REGISTRY,
  );
  assert.ok(def);
  assert.deepEqual(def.sections.map((s) => s.subjectId), ["mathematics"]);
  // Min-1 clamp can't bite here; single subject gets the full count.
  assert.equal(def.sections[0].count, 10);
});

test("buildCustomDefinition: no valid subjects → null", () => {
  assert.equal(buildCustomDefinition({ subjects: "nope", count: "10" }, REGISTRY), null);
  assert.equal(buildCustomDefinition({}, REGISTRY), null);
});

test("buildCustomDefinition clamps the count into 5..50", () => {
  const low = buildCustomDefinition({ subjects: "mathematics", count: "1" }, REGISTRY);
  assert.equal(low.sections[0].count, 5);
  const high = buildCustomDefinition({ subjects: "mathematics", count: "999" }, REGISTRY);
  assert.equal(high.sections[0].count, 50);
  const garbage = buildCustomDefinition({ subjects: "mathematics" }, REGISTRY);
  assert.equal(garbage.sections[0].count, 10); // default
});

test("buildCustomDefinition untimed papers report durationMinutes 0", () => {
  const def = buildCustomDefinition({ subjects: "mathematics", count: "10", timed: "0" }, REGISTRY);
  assert.equal(def.durationMinutes, 0);
});

/* ---------------------------------------------------------------- */

const QUESTIONS = [
  { question: "a", options: ["x", "y"], correct: 0, sectionTitle: "Alpha" },
  { question: "b", options: ["x", "y"], correct: 1, sectionTitle: "Alpha" },
  { question: "c", options: ["x", "y"], correct: 0, sectionTitle: "Beta" },
];

test("summarizeAttempt scores answers and splits per section", () => {
  const summary = summarizeAttempt(QUESTIONS, [0, 0, -1]);
  assert.equal(summary.total, 3);
  assert.equal(summary.answered, 2);
  assert.equal(summary.correct, 1);
  assert.equal(summary.percent, 33);
  assert.deepEqual(
    summary.sections.map((s) => [s.title, s.count, s.correct]),
    [["Alpha", 2, 1], ["Beta", 1, 0]],
  );
});

test("summarizeAttempt on a perfect paper", () => {
  const summary = summarizeAttempt(QUESTIONS, [0, 1, 0]);
  assert.equal(summary.correct, 3);
  assert.equal(summary.percent, 100);
  assert.ok(summary.sections.every((s) => s.correct === s.count));
});

test("summarizeAttempt with no questions is total 0, percent 0, no crash", () => {
  const summary = summarizeAttempt([], []);
  assert.equal(summary.total, 0);
  assert.equal(summary.percent, 0);
  assert.deepEqual(summary.sections, []);
});

test("summarizeAttempt ignores out-of-range choices (treated unanswered)", () => {
  const summary = summarizeAttempt(QUESTIONS, [7, 1, 2]);
  assert.equal(summary.answered, 1);
  assert.equal(summary.correct, 1);
});

/* ---------------------------------------------------------------- */

test("the catalog ships only valid, resolvable definitions", async () => {
  // Catalog sanity: ids unique, every section points at a subject that
  // actually exists in the real registry, counts positive. Catches a
  // typo'd subjectId (the engine would silently drop that section).
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/mock-tests.json"), "utf8"));
  const registry = JSON.parse(fs.readFileSync(path.join(root, "src/data/subject-registry.json"), "utf8"));

  const ids = catalog.tests.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, "catalog test ids must be unique");

  const subjectIds = new Set(registry.subjects.map((s) => s.id));
  const subSubjectIds = new Map(registry.subjects.map((s) => [s.id, new Set((s.subSubjects || []).map((x) => x.id))]));

  for (const t of catalog.tests) {
    assert.ok(t.title && t.description, `${t.id}: needs title + description`);
    assert.ok(t.durationMinutes === 0 || t.durationMinutes > 0, `${t.id}: bad duration`);
    assert.ok(t.sections.length > 0, `${t.id}: needs sections`);
    for (const s of t.sections) {
      assert.ok(subjectIds.has(s.subjectId), `${t.id}: unknown subject "${s.subjectId}"`);
      if (s.subSubjectId) {
        assert.ok(
          subSubjectIds.get(s.subjectId)?.has(s.subSubjectId),
          `${t.id}: unknown sub-subject "${s.subjectId}/${s.subSubjectId}"`,
        );
      }
      assert.ok(Number.isInteger(s.count) && s.count > 0, `${t.id}: bad count in "${s.title}"`);
    }
  }
});
