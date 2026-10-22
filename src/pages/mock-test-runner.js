// src/pages/mock-test-runner.js — the exam-mode runner: the "/mock-tests/
// <id>" half of the mock-test system (the catalog lives in mock-tests.js).
//
// Where the lesson quiz (components/mcq/*) is a tutor — instant right/wrong
// feedback, one question at a time — this page is an EXAM: nothing is
// revealed until you submit. The flow is
//
//   brief → running → confirm-submit → result (+ full review)
//
// The runner is deliberately its own component tree (no reuse of
// mcq-container.js, which hard-wires answer-then-reveal): selection is
// reversible, a question palette tracks answered/marked/current state,
// the timer (when the test has one) counts down and auto-submits, and the
// finished attempt is saved to IndexedDB (storage/mock-test-storage.js)
// so the catalog can show "Best %" badges.
//
// Custom batch tests arrive as /mock-tests/custom?subjects=…&count=…&timed=…
// (built by the catalog page's builder). The router strips query strings
// from route params, so — like pages/mcq.js reads ?lang — the query is
// re-read from router.currentPath() here.
import { createEl, empty, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { router } from "../core/router.js";
import { renderInlineMath } from "../engines/zolto/zolto-engine.js";
import { rovingTabIndex } from "../accessibility/keyboard.js";
import { listSubjects } from "../engines/subject-engine.js";
import {
  getMockTest,
  buildCustomDefinition,
  buildTestRun,
  summarizeAttempt,
} from "../engines/mock-test-engine.js";
import { saveMockTestAttempt } from "../storage/mock-test-storage.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { createSpinner } from "../components/common/spinner.js";

/** mm:ss for the timer (cap at 99:59 so the layout never jumps wider). */
function formatClock(totalSec) {
  const s = Math.max(0, Math.min(totalSec, 99 * 60 + 59));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function formatDuration(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

/** Query params for the custom test, read off the raw hash (router strips them). */
function customQueryParams() {
  return Object.fromEntries(
    new URLSearchParams(router.currentPath().split("?")[1] || "").entries(),
  );
}

/* ------------------------------------------------------------------ */
/* Brief screen — what you're about to sit, before "Start test".      */
/* ------------------------------------------------------------------ */

function sectionRow(section) {
  return createEl("li", { class: "ou-exam-brief__row" }, [
    createEl("span", {}, [`${section.count} × ${section.title}`]),
  ]);
}

function createBrief(def, totalQuestions, onStart) {
  return createEl("div", { class: "ou-card ou-exam-brief" }, [
    createEl("div", { class: "ou-exam-brief__head" }, [
      icon("clipboard-list", { class: "ou-mock-card__icon" }),
      createEl("div", {}, [
        createEl("div", { class: "ou-card__title" }, [def.title]),
        createEl("p", { class: "ou-text-sm ou-text-secondary" }, [def.description]),
      ]),
    ]),
    createEl("ul", { class: "ou-exam-brief__rows" }, def.sections.map(sectionRow)),
    createEl("p", { class: "ou-exam-brief__meta" }, [
      icon("circle-question"),
      `${totalQuestions} questions · `,
      def.durationMinutes
        ? `${def.durationMinutes} minutes — the clock auto-submits at zero`
        : "untimed — submit whenever you're done",
    ]),
    createEl("p", { class: "ou-exam-brief__note ou-text-sm ou-text-secondary" }, [
      "Answers are hidden until you submit. Questions are sampled fresh from the ",
      "question bank, so a retry gives you a brand-new paper.",
    ]),
    createEl("button", {
      type: "button",
      class: "ou-btn ou-btn--primary ou-exam-brief__start",
      on: { click: onStart },
    }, [icon("play"), "Start test"]),
  ]);
}

/* ------------------------------------------------------------------ */
/* Running screen                                                      */
/* ------------------------------------------------------------------ */

/**
 * One option button. Selection is reversible until submit (exam rules),
 * so — unlike mcq-option.js — these never disable and never show
 * correct/incorrect styling.
 */
function createExamOption(text, index, is_selected, onSelect) {
  return createEl("button", {
    type: "button",
    class: ["ou-exam-option", is_selected ? "ou-exam-option--selected" : ""],
    "aria-pressed": is_selected ? "true" : "false",
    on: { click: () => onSelect(index) },
  }, [text]);
}

function createRunningView(run, state, { onAnswer, onGoto, onMark, onSubmit, onTick, onFinish }) {
  const total = run.questions.length;

  /* --- chrome: title + timer + progress --------------------------- */
  const timerEl = createEl(
    "span",
    { class: "ou-exam-timer" },
    [icon("clock"), run.durationMinutes ? formatClock(run.durationMinutes * 60) : "Untimed"],
  );
  const answeredNow = createEl("span", { class: "ou-exam-count" }, ["0 answered"]);
  const head = createEl("div", { class: "ou-exam-head" }, [
    createEl("div", { class: "ou-exam-head__title" }, [
      createEl("h1", { class: "ou-exam-title" }, [run.title]),
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
        "Nothing is revealed until you submit — answers can be changed freely.",
      ]),
    ]),
    timerEl,
  ]);

  /* --- question card ---------------------------------------------- */
  const sectionChip = createEl("span", { class: "ou-exam-chip" }, [""]);
  const counterEl = createEl("span", { class: "ou-exam-counter" }, [""]);
  const questionText = createEl("p", { class: "ou-mcq-question" }, [""]);
  // Optional math (the MCQ schema's "zolto" field) — rendered exactly like
  // components/mcq/mcq-question.js renders it: Zolto's own trusted renderer
  // output, inserted via innerHTML.
  const mathEl = createEl("div", { class: "ou-mcq-question__math" });
  const optionsEl = createEl("div", { class: "ou-mcq-options", role: "radiogroup" });

  const markBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--ghost ou-btn--sm",
    "aria-pressed": "false",
    on: {
      click: () => {
        state.marked.has(state.index)
          ? state.marked.delete(state.index)
          : state.marked.add(state.index);
        onMark(state.index);
      },
    },
  }, [icon("flag"), "Mark for review"]);

  const questionCard = createEl("div", { class: "ou-card ou-exam-card" }, [
    createEl("div", { class: "ou-exam-card__top" }, [
      counterEl,
      createEl("div", { class: "ou-exam-card__tags" }, [sectionChip, markBtn]),
    ]),
    questionText,
    mathEl,
    optionsEl,
  ]);

  /* --- palette ------------------------------------------------------ */
  // Numbered grid of every question — the government-exam "question
  // palette": tap a number to jump; states read at a glance (filled =
  // answered, corner flag = marked, ring = where you are).
  const paletteButtons = run.questions.map((_, i) =>
    createEl("button", {
      type: "button",
      class: "ou-exam-palette__cell",
      "aria-label": `Go to question ${i + 1}`,
      on: { click: () => onGoto(i) },
    }, [String(i + 1)]),
  );
  const palette = createEl("div", { class: "ou-exam-palette", role: "group", "aria-label": "Question palette" }, [
    createEl("p", { class: "ou-exam-palette__label" }, [icon("list-check"), "Questions"]),
    createEl("div", { class: "ou-exam-palette__grid" }, paletteButtons),
    createEl("ul", { class: "ou-exam-palette__legend" }, [
      createEl("li", { class: "ou-exam-palette__legend-item" }, [
        createEl("span", { class: "ou-exam-palette__cell ou-exam-palette__cell--answered", "aria-hidden": "true" }, ["1"]),
        "answered",
      ]),
      createEl("li", { class: "ou-exam-palette__legend-item" }, [
        createEl("span", { class: "ou-exam-palette__cell ou-exam-palette__cell--marked", "aria-hidden": "true" }, ["1"]),
        "marked",
      ]),
    ]),
  ]);

  /* --- footer controls --------------------------------------------- */
  const prevBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary",
    on: { click: () => onGoto(state.index - 1) },
  }, [icon("chevron-left"), "Previous"]);

  const nextBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary",
    on: { click: () => onGoto(state.index + 1) },
  }, ["Next", icon("chevron-right")]);

  const submitBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--primary",
    on: { click: onSubmit },
  }, [icon("paper-plane"), "Submit test"]);

  const controls = createEl("div", { class: "ou-exam-controls" }, [prevBtn, nextBtn, submitBtn]);

  /* --- confirmation gate (two-step submit, no modal needed) -------- */
  const confirmBox = createEl("div", { class: "ou-card ou-exam-confirm", hidden: true });
  function renderConfirm() {
    empty(confirmBox);
    const unanswered = total - state.answers.filter((a) => a >= 0).length;
    const marked = state.marked.size;
    confirmBox.append(
      createEl("div", { class: "ou-card__title" }, ["Submit this test?"]),
      createEl("ul", { class: "ou-exam-confirm__rows" }, [
        createEl("li", {}, [`${total - unanswered} answered`]),
        createEl("li", { class: unanswered ? "ou-exam-confirm__warn" : "" }, [
          `${unanswered} unanswered${unanswered ? " — they'll score zero" : ""}`,
        ]),
        marked ? createEl("li", {}, [`${marked} marked for review`]) : null,
      ]),
      createEl("div", { class: "ou-exam-confirm__actions" }, [
        createEl("button", {
          type: "button",
          class: "ou-btn ou-btn--secondary",
          on: { click: () => { confirmBox.hidden = true; } },
        }, ["Keep going"]),
        createEl("button", {
          type: "button",
          class: "ou-btn ou-btn--primary",
          on: { click: () => onFinish(false) },
        }, [icon("paper-plane"), "Confirm submit"]),
      ]),
    );
  }

  /* --- question (re)render ----------------------------------------- */
  function renderQuestion() {
    const q = run.questions[state.index];

    sectionChip.textContent = q.sectionTitle || "Questions";
    counterEl.textContent = `Question ${state.index + 1} of ${total}`;
    questionText.textContent = q.question;
    mathEl.innerHTML = renderInlineMath(q.zolto);

    empty(optionsEl);
    q.options.forEach((text, i) => {
      optionsEl.appendChild(
        createExamOption(text, i, state.answers[state.index] === i, (choice) => {
          state.answers[state.index] = choice;
          onAnswer(state.index);
          paintOptionStates();
        }),
      );
    });
    rovingTabIndex(optionsEl, "button");
    paintOptionStates();
  }

  function paintOptionStates() {
    // Re-point the option buttons' selected classes at the current answer
    // without rebuilding the list (keeps focus + roving tabindex intact).
    const selected = state.answers[state.index];
    Array.from(optionsEl.children).forEach((btn, i) => {
      btn.classList.toggle("ou-exam-option--selected", i === selected);
      btn.setAttribute("aria-pressed", i === selected ? "true" : "false");
    });
  }

  /* --- palette / chrome (re)paint ---------------------------------- */
  function paintPalette() {
    paletteButtons.forEach((btn, i) => {
      btn.classList.toggle("ou-exam-palette__cell--answered", state.answers[i] >= 0);
      btn.classList.toggle("ou-exam-palette__cell--marked", state.marked.has(i));
      btn.classList.toggle("ou-exam-palette__cell--current", i === state.index);
    });
    const answeredCount = state.answers.filter((a) => a >= 0).length;
    answeredNow.textContent = `${answeredCount} answered`;
    markBtn.setAttribute(
      "aria-pressed",
      state.marked.has(state.index) ? "true" : "false",
    );
    markBtn.classList.toggle("ou-exam-mark--on", state.marked.has(state.index));
    prevBtn.disabled = state.index === 0;
    nextBtn.disabled = state.index === total - 1;
  }

  function paintAll() {
    renderQuestion();
    paintPalette();
  }

  /* --- timer -------------------------------------------------------- */
  // Deadline-based, not tick-counting: a throttled background tab must
  // never hand back extra seconds. One interval for the page's lifetime,
  // cleared on finish or when the page leaves the DOM (SPA nav).
  let deadline = null;
  let intervalId = null;
  function startClock() {
    if (!run.durationMinutes) return;
    deadline = Date.now() + run.durationMinutes * 60000;
    intervalId = setInterval(() => {
      if (!root.isConnected) { clearInterval(intervalId); return; }
      const remaining = Math.round((deadline - Date.now()) / 1000);
      timerEl.classList.toggle("ou-exam-timer--low", remaining <= 60);
      timerEl.replaceChildren(icon("clock"), formatClock(remaining));
      if (remaining <= 0) {
        clearInterval(intervalId);
        onFinish(true); // auto-submit
      } else {
        onTick?.(remaining);
      }
    }, 500);
  }

  const root = createEl("div", { class: "ou-container ou-stack ou-exam" }, [
    head,
    answeredNow,
    questionCard,
    palette,
    confirmBox,
    controls,
  ]);

  paintAll();
  startClock();

  return {
    root,
    repaint: paintPalette,
    rerenderQuestion: paintAll,
    showConfirm() {
      renderConfirm();
      confirmBox.hidden = false;
      // block:"center" — "nearest" could park the gate's buttons under the
      // fixed bottom nav, where taps land on the nav instead.
      confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    getElapsedSec: () => run.durationMinutes
      ? Math.min(run.durationMinutes * 60, Math.round((run.durationMinutes * 60000 - (deadline - Date.now())) / 1000))
      : Math.round((Date.now() - state.startedAt) / 1000),
  };
}

/* ------------------------------------------------------------------ */
/* Result screen                                                       */
/* ------------------------------------------------------------------ */

function createResultView(run, summary, durationSec, autoSubmitted, onRetry) {
  const score = `${summary.correct}/${summary.total}`;
  const sectionTable = createEl("table", { class: "ou-exam-sections" }, [
    createEl("thead", {}, [
      createEl("tr", {}, [
        createEl("th", { scope: "col" }, ["Section"]),
        createEl("th", { scope: "col" }, ["Score"]),
        createEl("th", { scope: "col" }, ["%"]),
      ]),
    ]),
    createEl("tbody", {},
      summary.sections.map((s) => createEl("tr", {}, [
        createEl("th", { scope: "row" }, [s.title]),
        createEl("td", { class: "ou-tabular-nums" }, [`${s.correct}/${s.count}`]),
        createEl("td", { class: "ou-tabular-nums" }, [`${Math.round((s.correct / s.count) * 100)}%`]),
      ])),
    ),
  ]);

  const review = createEl("ol", { role: "list", class: "ou-stack" },
    run.questions.map((q, i) => {
      const choice = summary.choiceAt?.(i) ?? -1;
      const wasCorrect = choice === q.correct;
      return createEl("li", { class: "ou-card ou-exam-review" }, [
        createEl("p", { class: "ou-exam-review__section" }, [
          createEl("span", { class: "ou-exam-chip" }, [q.sectionTitle || "Questions"]),
          `Q${i + 1}`,
        ]),
        createEl("p", { class: "ou-card__title" }, [q.question]),
        createEl("p", { class: wasCorrect ? "ou-mcq-review--correct" : "ou-mcq-review--incorrect" }, [
          `Your answer: ${q.options[choice] ?? "—"}${wasCorrect ? "" : ` (correct: ${q.options[q.correct]})`}`,
        ]),
        q.rationale ? createEl("p", { class: "ou-text-sm" }, [q.rationale]) : null,
      ]);
    }),
  );

  return createEl("div", { class: "ou-container ou-stack" }, [
    createEl("div", { class: "ou-mcq-result" }, [
      createEl("span", { class: ["ou-mcq-result__score", "ou-tabular-nums", summary.percent >= 70 ? "ou-mcq-result__score--high" : ""] }, [score]),
      createEl("span", { class: "ou-mcq-result__label" }, [`${summary.percent}% · ${formatDuration(durationSec)}${autoSubmitted ? " · auto-submitted" : ""}`]),
    ]),
    run.sections.length > 1
      ? createEl("div", { class: "ou-card" }, [
          createEl("div", { class: "ou-card__title" }, ["Section breakdown"]),
          sectionTable,
        ])
      : null,
    createEl("div", { class: "ou-exam-result__actions" }, [
      createEl("button", {
        type: "button",
        class: "ou-btn ou-btn--primary",
        on: { click: onRetry },
      }, [icon("rotate-right"), "Retry with fresh questions"]),
      createEl("a", { href: "#/mock-tests", class: "ou-btn ou-btn--secondary" }, [
        icon("clipboard-list"), "All mock tests",
      ]),
    ]),
    createEl("div", { class: "ou-section-title-row" }, [
      createEl("h2", {}, ["Review every question"]),
    ]),
    review,
  ]);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export async function render(container, { testId }, nav = null) {
  document.title = "Mock Test — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createSpinner({ label: "Building your test paper…" }),
  ]));

  // 1. Resolve the definition (catalog entry or custom query params).
  let definition;
  try {
    if (testId === "custom") {
      const subjects = await listSubjects();
      definition = buildCustomDefinition(customQueryParams(), subjects);
    } else {
      definition = await getMockTest(testId);
    }
  } catch (err) {
    if (nav?.stale) return;
    mount(container, createEmptyState({ message: `This test could not be loaded (${err.message}).` }));
    return;
  }
  if (nav?.stale) return;
  if (!definition) {
    mount(container, createEl("div", { class: "ou-container ou-stack" }, [
      createEmptyState({ message: "That mock test doesn't exist — it may have been renamed." }),
      createEl("p", { class: "ou-exam-center" }, [
        createEl("a", { href: "#/mock-tests", class: "ou-link" }, ["Back to all mock tests"]),
      ]),
    ]));
    return;
  }

  const totalQuestions = (definition.sections || []).reduce((sum, s) => sum + s.count, 0);

  // 2. Brief screen → Start materialises the run (fresh sampling happens
  //    per start, so every retry is a new paper).
  const stage = createEl("div", {});
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("a", { href: "#/mock-tests", class: "ou-back-link" }, [
      icon("chevron-left"), "All mock tests",
    ]),
    stage,
  ]));

  function showBrief() {
    mount(stage, createBrief(definition, totalQuestions, startTest));
  }
  showBrief();

  async function startTest() {
    if (nav?.stale) return;
    mount(stage, createEl("div", { class: "ou-container ou-stack" }, [
      createSpinner({ label: "Sampling questions…" }),
    ]));

    let run;
    try {
      run = await buildTestRun(definition);
    } catch (err) {
      if (nav?.stale) return;
      mount(stage, createEmptyState({ message: `Questions could not be loaded (${err.message}).` }));
      return;
    }
    if (nav?.stale) return;

    const state = {
      index: 0,
      answers: new Array(run.questions.length).fill(-1),
      marked: new Set(),
      startedAt: Date.now(),
    };

    // Real-exam hygiene: warn on tab close once anything is answered.
    // (SPA navigation has no router leave-hook; the back-link + note
    // above cover that path instead.)
    const beforeUnload = (event) => {
      if (state.answers.some((a) => a >= 0)) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);

    let finished = false;
    const view = createRunningView(run, state, {
      onAnswer: () => view.repaint(),
      onMark: () => view.repaint(),
      onGoto: (i) => {
        state.index = Math.max(0, Math.min(run.questions.length - 1, i));
        view.rerenderQuestion();
      },
      onSubmit: () => view.showConfirm(),
      onTick: () => view.repaint(),
      onFinish: (autoSubmitted = false) => finish(autoSubmitted),
    });
    mount(stage, view.root);

    function finish(autoSubmitted) {
      if (finished) return;
      finished = true;
      window.removeEventListener("beforeunload", beforeUnload);
      const durationSec = view.getElapsedSec();
      const summary = {
        ...summarizeAttempt(run.questions, state.answers),
        // The review list needs per-question choices; summarizeAttempt's
        // sections don't carry them, so hand them over separately.
        choiceAt: (i) => state.answers[i],
      };
      saveMockTestAttempt({
        testId: definition.id,
        title: run.title,
        score: summary.correct,
        total: summary.total,
        percent: summary.percent,
        durationSec,
        autoSubmitted,
        sections: summary.sections,
      }).catch(() => {}); // storage failure must never eat the result screen
      document.title = `${run.title} — Result — OpenKnowledge`;
      mount(stage, createResultView(run, summary, durationSec, autoSubmitted, () => {
        finished = false;
        startTest(); // re-sample a brand-new paper
      }));
    }
  }
}
