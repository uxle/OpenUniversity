// src/components/mcq/mcq-container.js — the quiz flow:
//   question (Skip → Continue pinned to the bottom) → results → review.
// Features adopted from the uxle/MCQs engine: skip, calm verdict card,
// keyboard answers (1-4 / A-D, Enter), per-topic results, "Practise N
// missed", a review screen and a results.json export. Scoring lives in
// engines/quiz-session.js so it is unit-tested.
import { createEl, empty } from "../../utils/dom.js";
import { createMcqQuestionView } from "./mcq-question.js";
import { createMcqProgress } from "./mcq-progress.js";
import { createMcqResult } from "./mcq-result.js";
import { createMcqReview } from "./mcq-review.js";
import { createButton } from "../common/button.js";
import {
  createSession, answer, skip, summarize, missedIndexes, topicBreakdown, exportResults, keyToOption,
} from "../../engines/quiz-session.js";

function download(name, obj) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  const a = createEl("a", { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** @param {{ title?: string, questions: object[] }} data @param {(correct:number, total:number) => void} [onComplete] */
export function createMcqContainer(data, onComplete, { lessonHref = null } = {}) {
  const root = createEl("div", { class: "ou-mcq" });
  const progressEl = createEl("div");
  const bodyEl = createEl("div", { class: "ou-mcq__body" });
  root.append(
    data.title ? createEl("div", { class: "ou-mcq__header" }, [createEl("h2", {}, [data.title])]) : null,
    progressEl, bodyEl,
  );

  let session, index, view, actionBtn, subset = false;

  function start(questions, isSubset) {
    subset = isSubset;
    session = createSession(questions);
    index = 0;
    renderQuestion();
  }

  function renderQuestion() {
    empty(progressEl); empty(bodyEl);
    progressEl.appendChild(createMcqProgress(index, session.questions.length));
    const q = session.questions[index];
    view = createMcqQuestionView(q, { lessonHref, onAnswered: (i) => { answer(session, index, i); setPrimary(true); } });
    actionBtn = createButton({ label: "Skip", variant: "ghost", onClick: onAction });
    const last = index === session.questions.length - 1;
    actionBtn.dataset.last = last ? "1" : "";
    bodyEl.append(view, createEl("div", { class: "ou-mcq-footer" }, [actionBtn]));
  }

  function setPrimary(answered) {
    const last = actionBtn.dataset.last === "1";
    actionBtn.className = answered ? "ou-btn ou-btn--primary" : "ou-btn ou-btn--ghost";
    actionBtn.textContent = answered ? (last ? "Finish" : "Continue") : "Skip";
    if (answered) actionBtn.focus({ preventScroll: true });
  }

  function onAction() {
    if (!view.isAnswered()) { view.skipQuestion(); skip(session, index); }
    index++;
    index >= session.questions.length ? renderResults() : renderQuestion();
    window.scrollTo?.({ top: 0 });
  }

  function renderResults() {
    empty(progressEl); empty(bodyEl);
    view = null;
    const summary = summarize(session);
    const full = !subset;
    bodyEl.appendChild(createMcqResult(summary, topicBreakdown(session), {
      isSubset: subset,
      onPractiseMissed: () => start(missedIndexes(session).map((i) => session.questions[i]), true),
      onRetry: () => start(data.questions, false),
      onRetakeAll: () => start(data.questions, false),
      lessonHref,
      onReview: renderReview,
      onExport: () => download("results.json", exportResults(session, data.title || "Quiz")),
    }));
    bodyEl.querySelector("#ou-mcq-result-title")?.focus({ preventScroll: true });
    // A practice run of only the missed questions must not overwrite the
    // learner's stored score for the lesson.
    if (full) onComplete?.(summary.correct, summary.total);
  }

  function renderReview() {
    empty(bodyEl);
    bodyEl.append(
      createButton({ label: "Back to results", variant: "secondary", onClick: renderResults }),
      lessonHref ? createEl("a", { class: "ou-btn ou-btn--primary", href: lessonHref }, ["Open the lesson"]) : null,
      createMcqReview(session, missedIndexes(session)),
    );
    window.scrollTo?.({ top: 0 });
  }

  // Keyboard: 1-4 / A-D answer, Enter continues (never steals Enter from a focused button).
  const onKey = (e) => {
    if (!root.isConnected) { document.removeEventListener("keydown", onKey); return; }
    if (!view || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Enter") {
      if (view.isAnswered() && document.activeElement !== actionBtn) { e.preventDefault(); onAction(); }
      return;
    }
    const i = keyToOption(e.key, session.questions[index].options.length);
    if (i >= 0 && !view.isAnswered()) { e.preventDefault(); view.choose(i); }
  };
  document.addEventListener("keydown", onKey);

  start(data.questions, false);
  return root;
}
