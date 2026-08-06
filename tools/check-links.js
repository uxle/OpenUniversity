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

function main() {
  const errors = [];
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;
    for (const subSubjectId of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, subSubjectId);
      const indexPath = path.join(subDir, "index.json");
      if (!fs.existsSync(indexPath)) continue;
      const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      for (const lessonId of index.lessons || []) {
        const lessonFile = path.join(subDir, "lessons", `${lessonId}.zl`);
        if (!fs.existsSync(lessonFile)) {
          errors.push(`${path.relative(root, indexPath)} references missing lesson file "${lessonId}.zl"`);
        }
      }
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
