#!/usr/bin/env node
// tools/validate-zolto.js — compiles every .zl file through the Zolto
// engine (src/engines/zolto/zolto-engine.js → vendor/zolto/, the real
// zolto@1.0.2 package vendored for zero-install static hosting) and
// reports diagnostics. No install step needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function walkZl(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkZl(full, out);
    else if (entry.name.endsWith(".zl")) out.push(full);
  }
  return out;
}

async function main() {
  let parseLesson;
  try {
    ({ parseLesson } = await import("../src/engines/zolto/zolto-engine.js"));
  } catch (err) {
    console.error("Could not load the Zolto adapter — did you run `npm install`?");
    console.error(err.message);
    process.exit(1);
  }

  const files = walkZl(path.join(root, "src/subjects"));
  let hadErrors = false;
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const { errors, warnings } = parseLesson(source);
    if (errors?.length) {
      hadErrors = true;
      console.error(`${path.relative(root, file)}:`);
      errors.forEach((e) => console.error(`  error: ${e.message || e}`));
    }
    if (warnings?.length) {
      warnings.forEach((w) => console.warn(`  warning (${path.relative(root, file)}): ${w.message || w}`));
    }
  }
  if (hadErrors) process.exit(1);
  console.log(`Validated ${files.length} .zl file(s) against the real Zolto engine.`);
}

main();
