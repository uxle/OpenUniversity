// src/components/mcq/mcq-review.js — post-quiz review list.
import { createEl } from "../../utils/dom.js";

/** @param {{ question, options, correct, rationale }[]} questions @param {number[]} selectedIndexes */
export function createMcqReview(questions, selectedIndexes) {
  return createEl("ol", { role: "list", class: "ou-stack" }, questions.map((q, i) => {
    const wasCorrect = selectedIndexes[i] === q.correct;
    return createEl("li", { class: "ou-card" }, [
      createEl("p", { class: "ou-card__title" }, [q.question]),
      createEl("p", { class: wasCorrect ? "ou-mcq-review--correct" : "ou-mcq-review--incorrect" }, [
        `Your answer: ${q.options[selectedIndexes[i]] ?? "—"}${wasCorrect ? "" : ` (correct: ${q.options[q.correct]})`}`,
      ]),
      createEl("p", { class: "ou-text-sm" }, [q.rationale || ""]),
    ]);
  }));
}
