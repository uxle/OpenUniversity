#!/usr/bin/env node
// tools/check-duplicates.js — finds duplicate subject/sub-subject ids and
// duplicate MCQ question ids within a file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const subjectsDir = path.join(root, "src/subjects");

function main() {
  const errors = [];
  const seenSubjectIds = new Set();

  for (const subjectId of fs.readdirSync(subjectsDir)) {
    if (seenSubjectIds.has(subjectId)) errors.push(`Duplicate subject id "${subjectId}"`);
    seenSubjectIds.add(subjectId);

    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;

    const seenSubIds = new Set();
    for (const subSubjectId of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, subSubjectId);
      if (!fs.statSync(subDir).isDirectory()) continue;
      if (!fs.existsSync(path.join(subDir, "details.zl"))) continue; // not a sub-subject
      if (seenSubIds.has(subSubjectId)) errors.push(`Duplicate sub-subject id "${subSubjectId}" under "${subjectId}"`);
      seenSubIds.add(subSubjectId);

      const mcqDir = path.join(subDir, "mcq");
      if (!fs.existsSync(mcqDir)) continue;
      for (const file of fs.readdirSync(mcqDir)) {
        if (!file.endsWith(".json")) continue;
        const data = JSON.parse(fs.readFileSync(path.join(mcqDir, file), "utf8"));
        const ids = (data.questions || []).map((q) => q.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        if (dupes.length) errors.push(`Duplicate question id(s) in ${path.relative(root, path.join(mcqDir, file))}: ${[...new Set(dupes)].join(", ")}`);
      }
    }
  }

  if (errors.length) {
    console.error(`Found ${errors.length} duplicate(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log("No duplicates found.");
}

main();
