// tests/content/index-json-consistency.test.js — generalizes the existing
// physics-only check in lesson-validation.test.js to every subject and
// sub-subject in src/subjects/. Written after reasoning was restructured
// from a flat subject into 11 topic sub-subjects (clock/, blood-relation/,
// etc.) — a large file-moving change like that is exactly the kind of
// change that can silently leave an index.json out of sync with what's
// actually on disk (a lesson moved but not re-listed, or listed but not
// moved). Checks both directions: every listed id has a file, and every
// file is listed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const subjectsDir = path.join(root, "src/subjects");

/** Every directory in src/subjects/ that has its own index.json directly
 *  inside it — a subject's own root, or a real sub-subject folder (same
 *  test tools/generate-registry.js and tools/check-links.js use). */
function findIndexedDirs() {
  const dirs = [];
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;
    if (fs.existsSync(path.join(subjectDir, "index.json"))) {
      dirs.push({ label: subjectId, dir: subjectDir });
    }
    for (const entry of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, entry);
      if (!fs.statSync(subDir).isDirectory()) continue;
      if (fs.existsSync(path.join(subDir, "index.json"))) {
        dirs.push({ label: `${subjectId}/${entry}`, dir: subDir });
      }
    }
  }
  return dirs;
}

test("every index.json lesson id has a matching .zl file on disk", () => {
  for (const { label, dir } of findIndexedDirs()) {
    const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
    const lessonsDir = path.join(dir, "lessons");
    for (const lessonId of index.lessons || []) {
      const filePath = path.join(lessonsDir, `${lessonId}.zl`);
      assert.ok(fs.existsSync(filePath), `${label}/index.json references missing lesson "${lessonId}"`);
    }
  }
});

test("every .zl file in a lessons/ dir is listed in its index.json", () => {
  for (const { label, dir } of findIndexedDirs()) {
    const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
    const listed = new Set(index.lessons || []);
    const lessonsDir = path.join(dir, "lessons");
    if (!fs.existsSync(lessonsDir)) continue;
    for (const file of fs.readdirSync(lessonsDir)) {
      if (!file.endsWith(".zl")) continue;
      const lessonId = file.replace(/\.zl$/, "").replace(/\.[a-z]{2}$/, ""); // strip optional .<lang>
      const baseId = file.replace(/\.zl$/, "");
      assert.ok(
        listed.has(baseId) || listed.has(lessonId),
        `${label}/lessons/${file} is not listed in ${label}/index.json`,
      );
    }
  }
});
