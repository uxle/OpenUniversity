#!/usr/bin/env node
// tools/build-search-index.js — walks src/subjects/**/lessons/*.zl and
// writes src/data/search-index.json for search-service.js to consume.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const subjectsDir = path.join(root, "src/subjects");

function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function plainText(zlSource) {
  return zlSource
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/@\w+[\s\S]*?@\/\w+/g, " ")
    .replace(/\[\/?[a-z]+[^\]]*\]/gi, " ")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function walkLessons() {
  const entries = [];
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;
    for (const subSubjectId of fs.readdirSync(subjectDir)) {
      const lessonsDir = path.join(subjectDir, subSubjectId, "lessons");
      if (!fs.existsSync(lessonsDir)) continue;
      for (const file of fs.readdirSync(lessonsDir)) {
        if (!file.endsWith(".zl")) continue;
        const lessonId = file.replace(".zl", "");
        const source = fs.readFileSync(path.join(lessonsDir, file), "utf8");
        entries.push({
          lessonId, subjectId, subSubjectId,
          title: extractTitle(source) || lessonId,
          subject: subjectId,
          keywords: [],
          content: plainText(source).slice(0, 500),
        });
      }
    }
  }
  return entries;
}

function main() {
  const entries = walkLessons();
  const outPath = path.join(root, "src/data/search-index.json");
  fs.writeFileSync(outPath, JSON.stringify({ entries }, null, 2) + "\n");
  console.log(`Wrote ${outPath} (${entries.length} lessons indexed)`);
}

main();
