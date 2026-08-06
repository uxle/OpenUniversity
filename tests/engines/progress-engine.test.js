// tests/engines/progress-engine.test.js
// Full progress-engine.js needs IndexedDB (browser-only); this exercises
// the pure streak-calculation logic in progress-service.js via injected
// records, and the date helpers it depends on.
import test from "node:test";
import assert from "node:assert/strict";
import { computeStreak } from "../../src/services/progress-service.js";
import { isConsecutiveDay, daysBetween } from "../../src/utils/dates.js";

test("daysBetween counts whole days", () => {
  assert.equal(daysBetween("2026-01-01", "2026-01-04"), 3);
});

test("isConsecutiveDay is true for back-to-back dates", () => {
  assert.equal(isConsecutiveDay("2026-01-01", "2026-01-02"), true);
  assert.equal(isConsecutiveDay("2026-01-01", "2026-01-03"), false);
});

test("computeStreak counts back-to-back study days ending today", async () => {
  const today = new Date();
  const y1 = new Date(today); y1.setDate(today.getDate() - 1);
  const y2 = new Date(today); y2.setDate(today.getDate() - 2);
  const records = [
    { lastStudied: y2.toISOString() },
    { lastStudied: y1.toISOString() },
    { lastStudied: today.toISOString() },
  ];
  assert.equal(await computeStreak(records), 3);
});

test("computeStreak resets to 0 with no recent study", async () => {
  const old = new Date("2020-01-01");
  assert.equal(await computeStreak([{ lastStudied: old.toISOString() }]), 0);
});
