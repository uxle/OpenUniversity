import test from "node:test";
import assert from "node:assert/strict";
import { createSession, answer, skip, summarize, missedIndexes, topicBreakdown, exportResults, messageFor, keyToOption } from "../../src/engines/quiz-session.js";

const qs = [
  { question: "q1", options: ["a", "b", "c", "d"], correct: 1, category: "History" },
  { question: "q2", options: ["a", "b", "c", "d"], correct: 0, category: "History" },
  { question: "q3", options: ["a", "b", "c", "d"], correct: 3, category: "Geography" },
  { question: "q4", options: ["a", "b", "c", "d"], correct: 2, category: "Geography" },
];
function run() {
  const s = createSession(qs);
  answer(s, 0, 1); answer(s, 1, 3); skip(s, 2);
  return s; // q4 unanswered
}

test("skipped and unanswered are neither correct nor wrong, and totals add up", () => {
  const sum = summarize(run());
  assert.deepEqual([sum.correct, sum.incorrect, sum.skipped, sum.total], [1, 1, 2, 4]);
  assert.equal(sum.correct + sum.incorrect + sum.skipped, sum.total);
  assert.equal(sum.percent, 25);
});

test("first answer wins", () => {
  const s = createSession(qs);
  assert.equal(answer(s, 0, 0), true);
  assert.equal(answer(s, 0, 1), false);
  assert.equal(summarize(s).incorrect, 1);
});

test("missedIndexes lists wrong and skipped in order", () => {
  assert.deepEqual(missedIndexes(run()), [1, 2, 3]);
});

test("topic breakdown is weakest first and hidden for a single topic", () => {
  const t = topicBreakdown(run());
  assert.deepEqual(t.map((x) => [x.topic, x.accuracy]), [["Geography", 0], ["History", 50]]);
  assert.deepEqual(topicBreakdown(createSession([{ ...qs[0], category: "X" }])), []);
});

test("export has the results.json shape", () => {
  const out = exportResults(run(), "Demo", new Date("2026-01-01T00:00:00Z"));
  assert.equal(out.weakestTopic, "Geography");
  assert.equal(out.responses[1].yourAnswer, "d");
  assert.equal(out.responses[2].yourAnswer, null);
  assert.equal(out.responses[2].result, "skipped");
  assert.equal(out.completedAt, "2026-01-01T00:00:00.000Z");
});

test("messages never shame and keys map to options", () => {
  assert.equal(messageFor({ percent: 0, correct: 0, total: 5, missed: 5 }).head, "A good start");
  assert.equal(messageFor({ percent: 100, correct: 5, total: 5, missed: 0 }).head, "Flawless run");
  assert.equal(keyToOption("b", 4), 1);
  assert.equal(keyToOption("3", 4), 2);
  assert.equal(keyToOption("5", 4), -1);
  assert.equal(keyToOption("Enter", 4), -1);
});
