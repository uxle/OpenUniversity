// tests/content/lesson-validation.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

test("every sub-subject with a lessons/ dir has a matching index.json entry", () => {
  const physicsIndex = JSON.parse(fs.readFileSync(
    path.join(root, "src/subjects/science/physics/index.json"), "utf8"
  ));
  const lessonFiles = fs.readdirSync(path.join(root, "src/subjects/science/physics/lessons"))
    .filter((f) => f.endsWith(".zl"))
    .map((f) => f.replace(".zl", ""));
  for (const lessonId of physicsIndex.lessons) {
    assert.ok(lessonFiles.includes(lessonId), `index.json references missing lesson "${lessonId}"`);
  }
});
