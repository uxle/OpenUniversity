#!/usr/bin/env node
// tools/generate-registry.js — scans src/subjects/ and writes
// src/data/subject-registry.json. This is the one place in the codebase
// intended to author that JSON file; run it, don't hand-edit the output.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const subjectsDir = path.join(root, "src/subjects");

function readIndexJSON(dir) {
  const file = path.join(dir, "index.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function titleFromZl(zlPath) {
  if (!fs.existsSync(zlPath)) return null;
  const text = fs.readFileSync(zlPath, "utf8");
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Reads the `@subject { title: "..." description: "..." }` metadata
 * block, when a details.zl file has one (schemas/subject.schema.json's
 * fields). Older/unwritten details.zl files only have a bare "# Title"
 * heading and no block — callers fall back to titleFromZl() for those.
 */
function metaFromZl(zlPath) {
  if (!fs.existsSync(zlPath)) return null;
  const text = fs.readFileSync(zlPath, "utf8");
  const block = text.match(/@subject\s*\{([\s\S]*?)\}/);
  if (!block) return null;
  const title = block[1].match(/title:\s*"([^"]*)"/)?.[1] ?? null;
  const description = block[1].match(/description:\s*"([^"]*)"/)?.[1] ?? null;
  return { title, description };
}

/** Total lesson count for one leaf directory, from its own index.json. */
function ownLessonCount(dir) {
  const index = readIndexJSON(dir);
  return index?.lessons?.length ?? 0;
}

function buildRegistry() {
  const subjects = [];
  for (const subjectId of fs.readdirSync(subjectsDir)) {
    const subjectDir = path.join(subjectsDir, subjectId);
    if (!fs.statSync(subjectDir).isDirectory()) continue;

    const detailsPath = path.join(subjectDir, "details.zl");
    const meta = metaFromZl(detailsPath);
    const subjectTitle = meta?.title || titleFromZl(detailsPath) || subjectId;
    const subjectDescription = meta?.description || "";

    const subSubjects = [];
    let lessonCount = ownLessonCount(subjectDir);
    for (const entry of fs.readdirSync(subjectDir)) {
      const subDir = path.join(subjectDir, entry);
      if (!fs.statSync(subDir).isDirectory()) continue;
      const index = readIndexJSON(subDir);
      if (!index) continue; // not a sub-subject folder

      const subDetailsPath = path.join(subDir, "details.zl");
      const subMeta = metaFromZl(subDetailsPath);
      const subLessonCount = index.lessons?.length ?? 0;
      lessonCount += subLessonCount;

      subSubjects.push({
        id: entry,
        title: subMeta?.title || titleFromZl(subDetailsPath) || entry,
        description: subMeta?.description || "",
        lessonCount: subLessonCount,
      });
    }

    subjects.push({ id: subjectId, title: subjectTitle, description: subjectDescription, lessonCount, subSubjects });
  }
  return { subjects };
}

function main() {
  const registry = buildRegistry();
  const outPath = path.join(root, "src/data/subject-registry.json");
  fs.writeFileSync(outPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Wrote ${outPath} (${registry.subjects.length} subjects)`);
}

main();
