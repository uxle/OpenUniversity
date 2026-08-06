// tests/engines/search-engine.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { scoreEntry, search } from "../../src/services/search-service.js";

const sampleEntries = [
  { lessonId: "lesson1", title: "Introduction to Motion", subject: "physics", keywords: ["motion", "velocity"], content: "Motion is a change in position." },
  { lessonId: "lesson2", title: "Newton's Laws", subject: "physics", keywords: ["force"], content: "Force and motion are related." },
  { lessonId: "lesson3", title: "Cell Biology", subject: "biology", keywords: ["cell"], content: "Cells are the basic unit of life." },
];

test("exact title match scores highest", () => {
  const exact = scoreEntry(sampleEntries[0], "introduction to motion", ["introduction", "to", "motion"]);
  const partial = scoreEntry(sampleEntries[1], "introduction to motion", ["introduction", "to", "motion"]);
  assert.ok(exact > partial);
});

test("search() ranks and filters via injected entries (no network needed)", async () => {
  const results = await search("motion", { entries: sampleEntries });
  assert.equal(results[0].lessonId, "lesson1");
  assert.ok(results.every((r) => r.lessonId !== "lesson3"));
});

test("empty query returns no results", async () => {
  const results = await search("   ", { entries: sampleEntries });
  assert.deepEqual(results, []);
});
