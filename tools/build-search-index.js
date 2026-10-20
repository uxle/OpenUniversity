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
  // Translation variants (lesson1.hi.zl) describe the same lesson at the
  // same route as their default-language counterpart — indexing both
  // produced duplicate search results pointing at one destination.
  // Translations are reached via the lesson page's language switcher.
  const TRANSLATION_RE = /\.[a-z]{2}\.zl$/;
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;

    // "Flat" subject — lessons sit directly under subjectDir/lessons (see
    // src/subjects/*/index.json — reasoning, economics, geography, history
    // all work this way). Previously this walk only ever looked for
    // <subjectDir>/<child>/lessons, one level too deep for these, so none
    // of their lessons were ever indexed for search. subSubjectId is left
    // undefined for these entries, matching the optional-segment routing
    // in app/constants.js / search-results.js.
    const ownLessonsDir = path.join(subjectDir, "lessons");
    if (fs.existsSync(ownLessonsDir)) {
      for (const file of fs.readdirSync(ownLessonsDir)) {
        if (!file.endsWith(".zl") || TRANSLATION_RE.test(file)) continue;
        const lessonId = file.replace(".zl", "");
        const source = fs.readFileSync(path.join(ownLessonsDir, file), "utf8");
        entries.push({
          lessonId, subjectId, subSubjectId: undefined,
          title: extractTitle(source) || lessonId,
          subject: subjectId,
          keywords: [],
          content: plainText(source).slice(0, 500),
        });
      }
    }

    // Real sub-subject folders — identified the same way
    // generate-registry.js does: a child directory with its own
    // index.json (not just any directory — "lessons" and "mcq" are
    // themselves child directories of a flat subject and must NOT be
    // mistaken for sub-subjects here).
    for (const subSubjectId of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, subSubjectId);
      if (!fs.statSync(subDir).isDirectory()) continue;
      if (!fs.existsSync(path.join(subDir, "index.json"))) continue;
      const lessonsDir = path.join(subDir, "lessons");
      if (!fs.existsSync(lessonsDir)) continue;
      for (const file of fs.readdirSync(lessonsDir)) {
        if (!file.endsWith(".zl") || TRANSLATION_RE.test(file)) continue;
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
