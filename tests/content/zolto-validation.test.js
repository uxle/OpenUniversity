// tests/content/zolto-validation.test.js — structural checks on .zl files
// that don't require the real Zolto engine to be installed (see
// tools/validate-zolto.js for the fuller check once `zolto` is available).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function findZlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findZlFiles(full));
    else if (entry.name.endsWith(".zl")) results.push(full);
  }
  return results;
}

test("every .zl file starts with a top-level heading", () => {
  const files = findZlFiles(path.join(root, "src/subjects"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    assert.match(text.trimStart(), /^#\s+\S/, `${path.relative(root, file)} is missing a top-level "# Title"`);
  }
});

test("admonition blocks are balanced ([x] has a matching [/x])", () => {
  const files = findZlFiles(path.join(root, "src/subjects"));
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    // [type] or [type key="value" ...] — not just a bare [type] with no
    // attributes, or any admonition using title="..." (a normal,
    // documented feature) reads as unopened here while its closer still
    // counts, guaranteeing a false mismatch. Mirrors the same fix in
    // tools/validate-content.js.
    const opens = [...text.matchAll(/\[([a-z]+)(?:\s[^\]\n]*)?\]/g)].map((m) => m[1]);
    const closes = [...text.matchAll(/\[\/([a-z]+)\]/g)].map((m) => m[1]);
    assert.deepEqual(opens.sort(), closes.sort(), `${path.relative(root, file)} has unbalanced admonitions`);
  }
});
