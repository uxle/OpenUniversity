// src/storage/mock-test-storage.js — saved mock-test attempts.
// Record shape: { id, testId, title, date, score, total, percent,
//                 durationSec, autoSubmitted, sections: [{title, count, correct}] }

import { getAll, put } from "./indexed-db.js";
import { uid } from "../utils/ids.js";

export async function saveMockTestAttempt({ testId, title, score, total, percent, durationSec, autoSubmitted, sections }) {
  const record = {
    id: uid("attempt"),
    testId,
    title,
    date: new Date().toISOString(),
    score,
    total,
    percent,
    durationSec,
    autoSubmitted: Boolean(autoSubmitted),
    sections,
  };
  await put("mockTests", record);
  return record;
}

export async function getMockTestAttempts() {
  return getAll("mockTests");
}

/** Best percent + attempt count per testId, for the catalog cards. */
export async function getAttemptSummaries() {
  const attempts = await getMockTestAttempts();
  const byTest = new Map();
  for (const attempt of attempts) {
    const current = byTest.get(attempt.testId) || { best: -1, attempts: 0 };
    current.best = Math.max(current.best, attempt.percent ?? 0);
    current.attempts++;
    byTest.set(attempt.testId, current);
  }
  return byTest;
}
