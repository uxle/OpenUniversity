// src/engines/quiz-session.js — pure quiz bookkeeping (no DOM) so the rules
// of scoring, skipping, "practise what I missed", per-topic accuracy and the
// results.json export are unit-tested in Node. Modelled on the uxle/MCQs
// engine: a skipped question is neither right nor wrong, and the results
// screen leads with the one concrete next step.

export const SKIPPED = -1;

/** @param {{correct:number}[]} questions */
export function createSession(questions) {
  return { questions, responses: new Array(questions.length).fill(undefined) };
}

export function answer(session, index, choice) {
  if (session.responses[index] !== undefined) return false; // first answer wins
  session.responses[index] = choice;
  return true;
}

export function skip(session, index) {
  return answer(session, index, SKIPPED);
}

export function resultOf(session, index) {
  const r = session.responses[index];
  if (r === undefined || r === SKIPPED) return "skipped";
  return r === session.questions[index].correct ? "correct" : "incorrect";
}

export function summarize(session) {
  let correct = 0, incorrect = 0, skipped = 0;
  session.questions.forEach((_, i) => {
    const r = resultOf(session, i);
    if (r === "correct") correct++;
    else if (r === "incorrect") incorrect++;
    else skipped++;
  });
  const total = session.questions.length;
  return { total, correct, incorrect, skipped, missed: incorrect + skipped, percent: total ? Math.round((correct / total) * 100) : 0 };
}

/** Indexes the learner got wrong or skipped, in original order. */
export function missedIndexes(session) {
  return session.questions.map((_, i) => i).filter((i) => resultOf(session, i) !== "correct");
}

export function topicOf(q) {
  return q.category || q.sectionTitle || "";
}

/** Per-topic accuracy, weakest first. Empty when there is only one topic. */
export function topicBreakdown(session) {
  const map = new Map();
  session.questions.forEach((q, i) => {
    const key = topicOf(q);
    if (!key) return;
    const t = map.get(key) || { topic: key, total: 0, correct: 0 };
    t.total++;
    if (resultOf(session, i) === "correct") t.correct++;
    map.set(key, t);
  });
  const rows = [...map.values()].map((t) => ({ ...t, accuracy: Math.round((t.correct / t.total) * 100) }));
  if (rows.length < 2) return [];
  return rows.sort((a, b) => a.accuracy - b.accuracy || a.topic.localeCompare(b.topic));
}

/** Same shape as the uxle/MCQs results.json. */
export function exportResults(session, title = "Quiz", now = new Date()) {
  const s = summarize(session);
  const topics = topicBreakdown(session);
  return {
    quizTitle: title,
    completedAt: now.toISOString(),
    totalQuestions: s.total,
    correct: s.correct,
    incorrect: s.incorrect,
    skipped: s.skipped,
    accuracy: s.percent,
    weakestTopic: topics.length ? topics[0].topic : null,
    topics,
    responses: session.questions.map((q, i) => {
      const r = session.responses[i];
      return {
        question: q.question,
        topic: topicOf(q) || null,
        yourAnswer: r === undefined || r === SKIPPED ? null : q.options[r],
        correctAnswer: q.options[q.correct],
        result: resultOf(session, i),
      };
    }),
  };
}

/** Peak-end copy: lead with what went well, then one doable next step. */
export function messageFor(summary) {
  const { percent, correct, total, missed } = summary;
  const n = missed === 1 ? "1 question" : `${missed} questions`;
  if (!total) return { head: "Quiz complete", sub: "" };
  if (percent === 100) return { head: "Flawless run", sub: `${correct} of ${total}. Every answer was right.` };
  if (percent >= 80) return { head: "Great work", sub: `${correct} of ${total} right. Just ${n} left to polish.` };
  if (percent >= 60) return { head: "Solid effort", sub: `${correct} of ${total} right. Revisit the ${n} you missed.` };
  if (percent >= 40) return { head: "Getting there", sub: `${correct} of ${total} right. Practise the ${n} you missed and it will stick.` };
  return { head: "A good start", sub: `${correct} of ${total} right. Try the ${n} you missed.` };
}

/** Maps a key press to an option index (1-9 or A-F), or -1. */
export function keyToOption(key, optionCount) {
  const k = String(key).toLowerCase();
  let i = -1;
  if (/^[1-9]$/.test(k)) i = Number(k) - 1;
  else if (/^[a-f]$/.test(k)) i = k.charCodeAt(0) - 97;
  return i >= 0 && i < optionCount ? i : -1;
}
