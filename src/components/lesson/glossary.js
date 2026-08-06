// src/components/lesson/glossary.js
import { createEl } from "../../utils/dom.js";

/** @param {{ term: string, definition: string }[]} terms */
export function createGlossary(terms = []) {
  if (!terms.length) return createEl("div");
  return createEl("dl", { class: "ou-glossary" }, terms.flatMap(({ term, definition }) => [
    createEl("dt", { class: "ou-glossary__term" }, [term]),
    createEl("dd", { class: "ou-glossary__def" }, [definition]),
  ]));
}
