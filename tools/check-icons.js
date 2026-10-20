#!/usr/bin/env node
// tools/check-icons.js — verify every icon name used across src/ resolves
// to a canonical FA6 free-solid name that (a) icons.js knows and (b) has a
// ::before rule in the generated vendor/fa-solid.css. Run in CI alongside
// the content validators so a renamed icon can't ship as a tofu box.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { resolveIconName } = await import(pathToFileURL(join(root, "src/utils/icons.js")));

const vendorCss = readFileSync(join(root, "src/styles/vendor/fa-solid.css"), "utf8");
const hasGlyph = (name) => vendorCss.includes(`.fa-${name}::before`);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (p.endsWith(".js") && !p.includes(".bundle.")) yield p;
  }
}

const literalCalls = [];
const iconNameProps = [];
const mapEntries = [];
for (const file of walk(join(root, "src"))) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bicon\(\s*"([a-z0-9-]+)"/g)) literalCalls.push([file, m[1]]);
  for (const m of src.matchAll(/iconName:\s*"([a-z0-9-]+)"/g)) iconNameProps.push([file, m[1]]);
  for (const m of src.matchAll(/(?:KNOWN_ICONS|TYPE_ICON|TABS|THEME_ICON)\s*=\s*\{[^}]*\}/gs)) {
    for (const mm of m[0].matchAll(/:\s*"([a-z0-9-]+)"/g)) mapEntries.push([file, mm[1]]);
  }
}

const problems = [];
const check = (file, name) => {
  const canonical = resolveIconName(name);
  if (!canonical) problems.push(`UNRESOLVED ${name} (${file.replace(root + "/", "")})`);
  else if (!hasGlyph(canonical)) problems.push(`NO GLYPH ${canonical} (${file.replace(root + "/", "")}) — re-run tools/build-icon-font.py`);
};

new Map(literalCalls.map(([f, n]) => [f + n, [f, n]])).forEach(([f, n]) => check(f, n));
new Map(iconNameProps.map(([f, n]) => [f + n, [f, n]])).forEach(([f, n]) => check(f, n));
new Map(mapEntries.map(([f, n]) => [f + n, [f, n]])).forEach(([f, n]) => check(f, n));

if (process.argv.includes("--verbose")) {
  console.log(`checked ${literalCalls.length} literal icon() calls, ${iconNameProps.length} iconName props, ${mapEntries.length} map entries`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("icons: all call sites resolve to generated FA solid glyphs");
