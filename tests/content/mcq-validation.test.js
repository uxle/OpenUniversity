// tests/content/mcq-validation.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMcqQuestion } from "../../src/core/validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function findMcqFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMcqFiles(full));
    else if (entry.name.endsWith("mcq.json")) results.push(full);
  }
  return results;
}

test("every *mcq.json under src/subjects has valid question objects", () => {
  const files = findMcqFiles(path.join(root, "src/subjects"));
  assert.ok(files.length > 0, "expected at least one mcq.json file");
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const q of data.questions || []) {
      const errors = validateMcqQuestion(q);
      assert.deepEqual(errors, [], `${path.relative(root, file)}: ${errors.join("; ")}`);
    }
  }
});
