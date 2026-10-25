// src/components/mcq/mcq-question.js — one question: options, verdict card.
// Answer → the chosen option is marked (a wrong pick shakes), the right one
// is revealed a beat later, and a verdict card explains why. Moving on is
// the container's job (pinned Skip → Continue button), so a long
// explanation never pushes the primary action off screen.
import { createEl } from "../../utils/dom.js";
import { createMcqOption } from "./mcq-option.js";
import { rovingTabIndex } from "../../accessibility/keyboard.js";
import { renderInlineMath } from "../../engines/zolto/zolto-engine.js";
import { icon } from "../../utils/icon.js";
import { setRich } from "../../utils/rich-text.js";

const reduceMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {{ question, zolto?, options, correct, rationale?, category? }} question
 * @param {{ onAnswered:(i:number)=>void, onSkip?:()=>void }} cb
 * @returns {HTMLElement & { choose:(i:number)=>void, skipQuestion:()=>void }}
 */
export function createMcqQuestionView(question, cb) {
  const { onAnswered, lessonHref = null } = typeof cb === "function" ? { onAnswered: cb } : cb;
  let done = false;
  const optionsEl = createEl("div", { class: "ou-mcq-options", role: "radiogroup", "aria-label": "Answer options" });
  const verdictEl = createEl("div", { class: "ou-mcq-verdict-slot", "aria-live": "polite" });

  function verdict(kind) {
    const copy = { correct: "Correct", incorrect: "Not quite", skipped: "Skipped" }[kind];
    const ic = { correct: "circle-check", incorrect: "circle-xmark", skipped: "circle-question" }[kind];
    verdictEl.replaceChildren(createEl("div", { class: `ou-mcq-verdict ou-mcq-verdict--${kind}` }, [
      createEl("p", { class: "ou-mcq-verdict__head" }, [
        icon(ic), copy,
        kind === "correct" ? null : createEl("span", { class: "ou-mcq-verdict__answer" }, [
          `Answer: ${String.fromCharCode(65 + question.correct)}`,
        ]),
      ]),
      question.rationale ? setRich(createEl("div", { class: "ou-mcq-verdict__why" }), question.rationale) : null,
      lessonHref && kind !== "correct"
        ? createEl("a", { class: "ou-mcq-verdict__learn", href: lessonHref }, [icon("book-open"), "Learn how this works in the lesson"])
        : null,
    ]));
    // The pinned footer would otherwise cover the explanation on phones.
    requestAnimationFrame(() => verdictEl.scrollIntoView?.({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" }));
  }

  function lock(chosen) {
    done = true;
    Array.from(optionsEl.children).forEach((el) => { el.disabled = true; });
    const reveal = () => Array.from(optionsEl.children)[question.correct].classList.add("ou-mcq-option--correct");
    if (chosen === question.correct) { reveal(); verdict("correct"); }
    else if (chosen === -1) { reveal(); verdict("skipped"); }
    else {
      const el = optionsEl.children[chosen];
      el.classList.add("ou-mcq-option--incorrect", "ou-mcq-option--shake");
      verdict("incorrect");
      reduceMotion() ? reveal() : setTimeout(reveal, 380);
    }
  }

  question.options.forEach((text, index) => {
    optionsEl.appendChild(createMcqOption(text, {
      onSelect: () => { if (!done) { lock(index); onAnswered(index); } },
    }));
  });
  rovingTabIndex(optionsEl, "button");

  const mathEl = createEl("div", { class: "ou-mcq-question__math" });
  mathEl.innerHTML = renderInlineMath(question.zolto);

  const root = createEl("div", { class: "ou-stack ou-mcq-qview" }, [
    question.category ? createEl("span", { class: "ou-exam-chip" }, [question.category]) : null,
    setRich(createEl("div", { class: "ou-mcq-question" }), question.question),
    mathEl, optionsEl, verdictEl,
  ]);
  root.choose = (i) => { if (!done && optionsEl.children[i]) optionsEl.children[i].click(); };
  root.skipQuestion = () => { if (!done) { lock(-1); } };
  root.isAnswered = () => done;
  return root;
}
