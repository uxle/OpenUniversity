// tests/engines/mcq-engine.test.js
// src/engines/mcq-engine.js itself manipulates the DOM directly (no DOM
// shim is installed in this environment — see package.json), so this
// tests the data contract it depends on instead: that real sample MCQ
// files satisfy core/validator.js's rules, which mirror schemas/mcq.schema.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMcqQuestion } from "../../src/core/validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), "utf8"));
}

test("physics motion MCQ sample matches the engine's expected shape", () => {
  const data = loadJSON("src/subjects/science/physics/mcq/lesson1mcq.json");
  assert.ok(Array.isArray(data.questions) && data.questions.length > 0);
  for (const q of data.questions) {
    assert.deepEqual(validateMcqQuestion(q), []);
  }
});

test("mcq-demo sample matches the engine's expected shape", () => {
  const data = loadJSON("examples/mcq-demo/lesson1mcq.json");
  for (const q of data.questions) {
    assert.deepEqual(validateMcqQuestion(q), []);
  }
});

test("validateMcqQuestion flags an out-of-range correct index", () => {
  const errors = validateMcqQuestion({
    id: 1, question: "Q?", options: ["a", "b"], correct: 5, rationale: "r",
  });
  assert.ok(errors.some((e) => e.includes("correct")));
});
