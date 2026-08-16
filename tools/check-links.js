#!/usr/bin/env node
// tools/check-links.js — flags @lessons/@subSubjects references in .zl
// details files, and index.json lesson lists, that don't point to a real
// file on disk.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const subjectsDir = path.join(root, "src/subjects");

function checkIndex(indexPath, lessonsDirForIndex, errors) {
  if (!fs.existsSync(indexPath)) return;
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  for (const lessonId of index.lessons || []) {
    const lessonFile = path.join(lessonsDirForIndex, `${lessonId}.zl`);
    if (!fs.existsSync(lessonFile)) {
      errors.push(`${path.relative(root, indexPath)} references missing lesson file "${lessonId}.zl"`);
    }
  }
}

function main() {
  const errors = [];
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;

    // A subject's own root-level index.json (its "own"/flat lessons, e.g.
    // src/subjects/economics/index.json) sits one level up from every
    // sub-subject's index.json checked below, and was previously never
    // checked here at all — the loop below only ever looked at
    // subjectDir/<child>/index.json, never subjectDir/index.json itself.
    // That gap is exactly how mathematics/computer-science/science ended
    // up with a phantom "lesson1" reference and no lessons/ directory to
    // back it, undetected until tests/content/index-json-consistency.test.js
    // caught it directly against the filesystem.
    checkIndex(path.join(subjectDir, "index.json"), path.join(subjectDir, "lessons"), errors);

    for (const subSubjectId of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, subSubjectId);
      checkIndex(path.join(subDir, "index.json"), path.join(subDir, "lessons"), errors);
    }
  }

  if (errors.length) {
    console.error(`Found ${errors.length} broken reference(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log("No broken content references found.");
}

main();
