// tests/content/search-index.test.js — tools/build-search-index.js used to
// only walk <subjectDir>/<child>/lessons, one level too deep for "flat"
// subjects whose lessons sit directly under <subjectDir>/lessons (see
// src/subjects/reasoning/index.json and friends — economics, geography,
// history). Every flat subject's lessons silently never made it into
// search-index.json. This locks in that every subject present in the
// registry has all of its own lessons represented in the search index.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), "utf8"));
}

test("every flat subject's own lessons appear in search-index.json", () => {
  const registry = readJSON("src/data/subject-registry.json");
  const searchIndex = readJSON("src/data/search-index.json");
  const indexedIds = new Set(searchIndex.entries.map((e) => `${e.subjectId}::${e.lessonId}`));

  const flatSubjects = registry.subjects.filter((s) => !(s.subSubjects || []).length);
  assert.ok(flatSubjects.length > 0, "expected at least one flat (no-subSubjects) subject to test against");

  for (const subject of flatSubjects) {
    const subjectIndexPath = path.join("src/subjects", subject.id, "index.json");
    if (!fs.existsSync(path.join(root, subjectIndexPath))) continue;
    const { lessons } = readJSON(subjectIndexPath);
    for (const lessonId of lessons) {
      assert.ok(
        indexedIds.has(`${subject.id}::${lessonId}`),
        `expected search-index.json to include flat subject "${subject.id}"'s lesson "${lessonId}"`,
      );
    }
  }
});

test("flat-subject entries in search-index.json have no subSubjectId", () => {
  const registry = readJSON("src/data/subject-registry.json");
  const searchIndex = readJSON("src/data/search-index.json");
  const flatIds = new Set(registry.subjects.filter((s) => !(s.subSubjects || []).length).map((s) => s.id));

  for (const entry of searchIndex.entries) {
    if (flatIds.has(entry.subjectId)) {
      assert.equal(entry.subSubjectId, undefined, `expected no subSubjectId on flat-subject entry ${entry.subjectId}/${entry.lessonId}`);
    }
  }
});
