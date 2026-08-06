// src/components/mcq/mcq-feedback.js — standalone feedback banner, used
// when composing a custom quiz flow instead of the built-in engine.
import { createEl } from "../../utils/dom.js";

export function createMcqFeedback(isCorrect, rationale) {
  return createEl("div", { class: `ou-mcq-feedback ${isCorrect ? "ou-mcq-feedback--correct" : "ou-mcq-feedback--incorrect"}` }, [
    createEl("strong", {}, [isCorrect ? "Correct." : "Not quite."]),
    rationale ? createEl("p", {}, [rationale]) : null,
  ]);
}
