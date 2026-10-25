// src/components/mcq/mcq-review.js — post-quiz review: every missed or
// skipped question laid out like the live quiz (options with ✓/✕), with
// the learner's pick and the explanation.
import { createEl } from "../../utils/dom.js";
import { setRich } from "../../utils/rich-text.js";
import { resultOf } from "../../engines/quiz-session.js";

/** @param {{questions:object[], responses:(number|undefined)[]}} session @param {number[]} [indexes] */
export function createMcqReview(session, indexes = session.questions.map((_, i) => i)) {
  return createEl("ol", { role: "list", class: "ou-stack ou-mcq-review" }, indexes.map((i) => {
    const q = session.questions[i];
    const pick = session.responses[i];
    const kind = resultOf(session, i);
    return createEl("li", { class: "ou-card ou-mcq-review__item" }, [
      createEl("p", { class: "ou-mcq-review__q" }, [
        createEl("span", { class: "ou-tabular-nums ou-mcq-review__n" }, [`Q${i + 1}`]),
        setRich(createEl("span", { class: "ou-mcq-review__qtext" }), q.question, { inline: true }),
      ]),
      createEl("ul", { class: "ou-mcq-review__opts", role: "list" }, q.options.map((text, oi) => {
        const cls = ["ou-mcq-review__opt"];
        let tag = "";
        if (oi === q.correct) { cls.push("is-correct"); tag = " ✓ correct answer"; }
        else if (oi === pick) { cls.push("is-wrong"); tag = " ✕ your answer"; }
        const li = createEl("li", { class: cls }, [`${String.fromCharCode(65 + oi)}. `]);
        li.append(setRich(createEl("span"), text, { inline: true }), tag);
        return li;
      })),
      kind === "skipped" ? createEl("p", { class: "ou-text-sm ou-mcq-review--incorrect" }, ["You skipped this one."]) : null,
      q.rationale ? setRich(createEl("div", { class: "ou-text-sm" }), q.rationale) : null,
    ]);
  }));
}
