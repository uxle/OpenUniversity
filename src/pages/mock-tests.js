// src/pages/mock-tests.js — the Mock Tests catalog: government-exam
// style mock papers, subject sprints and full-syllabus tests, plus the
// custom batch-test builder (pick subjects + question count, get a
// freshly sampled paper on every start).
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { listSubjects } from "../engines/subject-engine.js";
import { getMockTestCatalog } from "../engines/mock-test-engine.js";
import { getAttemptSummaries } from "../storage/mock-test-storage.js";
import { createEmptyState } from "../components/common/empty-state.js";
import { createSpinner } from "../components/common/spinner.js";
import { router } from "../core/router.js";

const COUNT_OPTIONS = [10, 15, 20, 25, 30];

function questionCount(test) {
  return (test.sections || []).reduce((sum, s) => sum + (s.count || 0), 0);
}

function createTestCard(test, best) {
  const count = questionCount(test);
  const metaBits = [
    `${count} questions`,
    test.durationMinutes ? `${test.durationMinutes} min` : "untimed",
    `${(test.sections || []).length} section${(test.sections || []).length === 1 ? "" : "s"}`,
  ];
  return createEl("a", { href: `#/mock-tests/${test.id}`, class: "ou-card ou-card--interactive ou-mock-card" }, [
    createEl("div", { class: "ou-mock-card__top" }, [
      icon("clipboard-list", { class: "ou-mock-card__icon" }),
      best && best.attempts > 0
        ? createEl("span", { class: "ou-mock-card__best" }, [
            icon("trophy"), `Best ${best.best}%`,
          ])
        : null,
    ]),
    createEl("div", { class: "ou-card__title" }, [test.title]),
    createEl("p", { class: "ou-text-sm ou-text-secondary" }, [test.description]),
    createEl("p", { class: "ou-mock-card__meta" }, [
      icon("circle-question"), metaBits.join(" · "),
    ]),
  ]);
}

/** The custom batch-test builder: subject chips + count + timer toggle. */
function createCustomBuilder(subjects) {
  const selected = new Set();

  const chipsRow = createEl("div", { class: "ou-mock-chips", role: "group", "aria-label": "Pick subjects" });
  const countSelect = createEl("select", { class: "ou-mock-select", "aria-label": "Number of questions" },
    COUNT_OPTIONS.map((n, i) => createEl("option", { value: String(n), selected: i === 1 }, [`${n} questions`])));
  const timedCheck = createEl("input", { type: "checkbox", id: "ou-mock-timed", checked: true });
  const startBtn = createEl("button", { type: "button", class: "ou-btn ou-btn--primary", disabled: true }, [
    icon("list-check"), "Start custom test",
  ]);

  subjects.forEach((subject) => {
    const chip = createEl("button", {
      type: "button",
      class: "ou-mock-chip",
      "aria-pressed": "false",
      on: {
        click: () => {
          if (selected.has(subject.id)) selected.delete(subject.id);
          else selected.add(subject.id);
          chip.setAttribute("aria-pressed", selected.has(subject.id) ? "true" : "false");
          startBtn.disabled = selected.size === 0;
        },
      },
    }, [subject.title]);
    chipsRow.appendChild(chip);
  });

  startBtn.addEventListener("click", () => {
    if (!selected.size) return;
    const params = new URLSearchParams({
      subjects: [...selected].join(","),
      count: countSelect.value,
      timed: timedCheck.checked ? "1" : "0",
    });
    router.navigate(`/mock-tests/custom?${params.toString()}`);
  });

  return createEl("div", { class: "ou-card ou-mock-builder" }, [
    createEl("div", { class: "ou-mock-builder__head" }, [
      icon("list-check", { class: "ou-mock-card__icon" }),
      createEl("div", {}, [
        createEl("div", { class: "ou-card__title" }, ["Build your own batch test"]),
        createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
          "Pick any subjects — questions are sampled fresh from every matching lesson's quiz bank on each start.",
        ]),
      ]),
    ]),
    chipsRow,
    createEl("div", { class: "ou-mock-builder__controls" }, [
      countSelect,
      createEl("label", { class: "ou-mock-timed-label", for: "ou-mock-timed" }, [
        timedCheck,
        "Timed (90 sec per question)",
      ]),
      startBtn,
    ]),
  ]);
}

export async function render(container, _params, nav = null) {
  document.title = "Mock Tests — OpenKnowledge";

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createSpinner({ label: "Loading mock tests…" }),
  ]));

  let catalog, subjects, summaries;
  try {
    [catalog, subjects, summaries] = await Promise.all([
      getMockTestCatalog(),
      listSubjects(),
      getAttemptSummaries().catch(() => new Map()),
    ]);
  } catch (err) {
    if (nav?.stale) return;
    mount(container, createEmptyState({ message: `Mock tests could not be loaded (${err.message}).` }));
    return;
  }
  if (nav?.stale) return;

  const tests = catalog.tests || [];
  if (!tests.length) {
    mount(container, createEmptyState({ message: "No mock tests have been published yet." }));
    return;
  }

  // Preserve catalog order of categories.
  const categories = [];
  for (const test of tests) {
    if (!categories.includes(test.category)) categories.push(test.category);
  }

  const sections = [
    createEl("h1", {}, ["Mock Tests"]),
    createEl("p", { class: "ou-text-secondary" }, [
      "Exam-style batch tests sampled fresh from the whole question bank — ",
      "government-exam patterns, quick subject sprints, and full-syllabus challenges. ",
      "Every attempt draws different questions.",
    ]),
    createCustomBuilder(subjects),
  ];

  categories.forEach((category) => {
    sections.push(createEl("div", { class: "ou-section-title-row" }, [
      createEl("h2", {}, [category]),
    ]));
    sections.push(createEl("div", { class: "ou-grid" },
      tests
        .filter((t) => t.category === category)
        .map((t) => createTestCard(t, summaries.get(t.id))),
    ));
  });

  mount(container, createEl("div", { class: "ou-container ou-stack" }, sections));
}
