#!/usr/bin/env node
// tools/validate-content.js — checks .zl heading/id rules and *mcq.json
// files against schemas/mcq.schema.json's required fields. Read-only;
// exits non-zero on failure (wire into .github/workflows/validate.yml).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const subjectsDir = path.join(root, "src/subjects");

function walk(dir, matcher, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, matcher, out);
    else if (matcher(entry.name)) out.push(full);
  }
  return out;
}

function validateZl(file, errors) {
  const text = fs.readFileSync(file, "utf8");
  if (!/^#\s+\S/.test(text.trimStart())) {
    errors.push(`${path.relative(root, file)}: missing top-level "# Title" heading`);
  }
  const opens = [...text.matchAll(/\[([a-z]+)\]/g)].map((m) => m[1]).sort();
  const closes = [...text.matchAll(/\[\/([a-z]+)\]/g)].map((m) => m[1]).sort();
  if (JSON.stringify(opens) !== JSON.stringify(closes)) {
    errors.push(`${path.relative(root, file)}: unbalanced admonition blocks`);
  }
}

function validateMcqFile(file, errors) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    errors.push(`${path.relative(root, file)}: invalid JSON (${err.message})`);
    return;
  }
  if (!Array.isArray(data.questions)) {
    errors.push(`${path.relative(root, file)}: "questions" must be an array`);
    return;
  }
  const seenIds = new Set();
  for (const q of data.questions) {
    for (const field of ["id", "question", "options", "correct", "rationale"]) {
      if (q[field] === undefined) errors.push(`${path.relative(root, file)}: question ${q.id ?? "?"} missing "${field}"`);
    }
    if (Array.isArray(q.options) && q.options.length < 2) {
      errors.push(`${path.relative(root, file)}: question ${q.id} needs at least 2 options`);
    }
    if (Number.isInteger(q.correct) && Array.isArray(q.options) && (q.correct < 0 || q.correct >= q.options.length)) {
      errors.push(`${path.relative(root, file)}: question ${q.id} has an out-of-range "correct" index`);
    }
    if (seenIds.has(q.id)) errors.push(`${path.relative(root, file)}: duplicate question id "${q.id}"`);
    seenIds.add(q.id);
  }
}

function main() {
  const errors = [];
  walk(subjectsDir, (name) => name.endsWith(".zl")).forEach((f) => validateZl(f, errors));
  walk(subjectsDir, (name) => name.endsWith("mcq.json")).forEach((f) => validateMcqFile(f, errors));

  if (errors.length) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log("Content validation passed.");
}

main();
