// src/components/mcq/mcq-question.js
import { createEl } from "../../utils/dom.js";
import { createMcqOption } from "./mcq-option.js";
import { rovingTabIndex } from "../../accessibility/keyboard.js";
import { renderInlineMath } from "../../engines/zolto/zolto-engine.js";

/**
 * @param {{ id, question, zolto?, options, correct, rationale }} question
 * @param {(correct: boolean) => void} onAnswered
 */
export function createMcqQuestionView(question, onAnswered) {
  let answered = false;
  const optionsContainer = createEl("div", { class: "ou-mcq-options", role: "radiogroup" });
  const feedback = createEl("div", { class: "ou-text-sm" });

  question.options.forEach((text, index) => {
    const option = createMcqOption(text, {
      onSelect: () => {
        if (answered) return;
        answered = true;
        const isCorrect = index === question.correct;
        Array.from(optionsContainer.children).forEach((el, i) => {
          el.disabled = true;
          if (i === question.correct) el.classList.add("ou-mcq-option--correct");
          else if (i === index) el.classList.add("ou-mcq-option--incorrect");
        });
        feedback.textContent = question.rationale || "";
        onAnswered(isCorrect);
      },
    });
    optionsContainer.appendChild(option);
  });

  rovingTabIndex(optionsContainer, "button");

  // Optional math display (schemas/mcq.schema.json "zolto" field). Built the
  // same way lesson content is: Zolto's own renderer produces the HTML,
  // which is trusted and inserted directly — see
  // src/components/lesson/lesson-content.js for the identical pattern.
  // renderInlineMath() already returns "" for an empty/absent field, so
  // this container is simply left empty rather than needing an extra
  // presence check here.
  const mathEl = createEl("div", { class: "ou-mcq-question__math" });
  mathEl.innerHTML = renderInlineMath(question.zolto);

  return createEl("div", { class: "ou-stack" }, [
    createEl("p", { class: "ou-mcq-question" }, [question.question]),
    mathEl,
    optionsContainer,
    feedback,
  ]);
}
