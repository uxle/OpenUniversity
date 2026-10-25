import test from "node:test";
import assert from "node:assert/strict";
import { looksLikeZolto, richHtml } from "../src/utils/rich-text.js";

test("currency, cell refs and prose stay plain text", () => {
  for (const s of ["US$12 billion", "Forms like A1, $A$1, A$1 and $A1", "between $100 and $75,000 so", "5 * 3 = 15", "a_b", "Which is NOT a CAPF?"]) {
    assert.equal(looksLikeZolto(s), false, s);
    assert.equal(richHtml(s), null);
  }
});

test("math, code, bold, directives, tables and multi-line are Zolto", () => {
  for (const s of ["Evaluate $\\frac{1}{2}+\\frac{1}{4}$", "$x$", "Run `ls -l`", "It is **bold**", "Text\n\n@math\nx^2\n@/math", "| a | b |\n| --- | --- |\n| 1 | 2 |", "line one\nline two"]) {
    assert.equal(looksLikeZolto(s), true, s);
  }
});

test("inline mode unwraps one paragraph; html is escaped", () => {
  assert.equal(richHtml("Use **bold**", { inline: true }), "Use <strong>bold</strong>");
  assert.match(richHtml("Use **bold**"), /^<p>/);
  const evil = richHtml("**x** <img src=x onerror=alert(1)>", { inline: true });
  assert.ok(!evil.includes("<img"));
});

test("math renders without an error node", () => {
  const h = richHtml("What is $\\frac{3}{4}$ of 20?", { inline: true });
  assert.match(h, /zl-math/);
  assert.ok(!h.includes("zl-merror"));
  assert.ok(!h.includes("<style"));
});
