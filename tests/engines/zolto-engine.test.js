// tests/engines/zolto-engine.test.js
// zolto-engine.js now imports the real, published `zolto` npm package
// (vendored into ./src/engines/zolto/vendor/zolto/ so the repo keeps its
// zero-install, zero-network-call property for static hosting — see
// zolto-engine.js's header for the full history). These tests run
// against the real engine's actual output, not a reimplementation.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileLesson, parseLesson } from "../../src/engines/zolto/zolto-engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enginePath = path.resolve(__dirname, "../../src/engines/zolto/zolto-engine.js");

test("zolto-engine.js exports the expected adapter functions", () => {
  const source = fs.readFileSync(enginePath, "utf8");
  for (const fn of ["compileLesson", "parseLesson", "renderLesson", "parseLessonInteractive", "renderLessonInteractive"]) {
    assert.ok(source.includes(`export function ${fn}`), `missing export: ${fn}`);
  }
});

test("compileLesson() renders real HTML", () => {
  const html = compileLesson("# Title\n\nHello.");
  assert.match(html, /<h1[^>]*>Title<\/h1>/);
  assert.match(html, /<p>Hello\.<\/p>/);
});

test("compileLesson() renders admonitions, math blocks, and tables", () => {
  const html = compileLesson([
    "# Heading",
    "",
    "[definition]",
    "A term.",
    "[/definition]",
    "",
    "@math label=\"eq:1\"",
    "v = \\frac{d}{t}",
    "@/math",
    "",
    "| A | B |",
    "| --- | --- |",
    "| 1 | 2 |",
  ].join("\n"));
  assert.match(html, /zl-admonition-definition/);
  assert.match(html, /zl-math zl-math-display/);
  assert.match(html, /zl-frac-num/);
  assert.match(html, /<table/);
  assert.doesNotMatch(html, /zl-render-error|render-error/);
});

test("compileLesson() never throws, even on malformed input", () => {
  assert.doesNotThrow(() => compileLesson("[unclosed]\nno closing tag"));
  assert.doesNotThrow(() => compileLesson(""));
  assert.doesNotThrow(() => compileLesson(null));
});

test("parseLesson() returns an ast plus empty errors/warnings for valid input", () => {
  const { ast, errors, warnings } = parseLesson("# Title\n\nBody text.");
  assert.equal(errors.length, 0);
  assert.equal(warnings.length, 0);
  assert.ok(Array.isArray(ast.children));
  assert.equal(ast.children[0].type, "heading");
});
