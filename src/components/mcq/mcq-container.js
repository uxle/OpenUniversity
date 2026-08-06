// src/components/mcq/mcq-container.js — orchestrates the componentized
// MCQ flow for embedding within a page (question -> progress -> result).
// Independent of src/engines/mcq-engine.js, which remains the
// zero-dependency, self-contained option for standalone embedding.
import { createEl, empty, mount } from "../../utils/dom.js";
import { createMcqQuestionView } from "./mcq-question.js";
import { createMcqProgress } from "./mcq-progress.js";
import { createMcqResult } from "./mcq-result.js";
import { createMcqReview } from "./mcq-review.js";

/** @param {{ title?: string, questions: object[] }} data @param {(correct:number, total:number) => void} [onComplete] */
export function createMcqContainer(data, onComplete) {
  const root = createEl("div", { class: "ou-mcq" });
  const progressEl = createEl("div");
  const bodyEl = createEl("div");
  root.append(
    data.title ? createEl("div", { class: "ou-mcq__header" }, [createEl("h2", {}, [data.title])]) : null,
    progressEl, bodyEl,
  );

  let index = 0;
  let correctCount = 0;
  const selected = [];

  function renderQuestion() {
    empty(progressEl);
    progressEl.appendChild(createMcqProgress(index, data.questions.length));
    empty(bodyEl);
    const question = data.questions[index];
    bodyEl.appendChild(createMcqQuestionView(question, (isCorrect) => {
      if (isCorrect) correctCount++;
      selected[index] = question.options.findIndex((_, i) => (isCorrect ? i === question.correct : true));
      setTimeout(next, 900);
    }));
  }

  function next() {
    index++;
    if (index >= data.questions.length) {
      renderResult();
    } else {
      renderQuestion();
    }
  }

  function renderResult() {
    empty(progressEl);
    empty(bodyEl);
    bodyEl.append(
      createMcqResult(correctCount, data.questions.length, { onRetry: () => { index = 0; correctCount = 0; selected.length = 0; renderQuestion(); } }),
      createMcqReview(data.questions, selected),
    );
    onComplete?.(correctCount, data.questions.length);
  }

  renderQuestion();
  return root;
}
