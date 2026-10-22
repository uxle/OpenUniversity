// src/pages/progress.js — the learner's dashboard. It used to be a dead
// end (a card linking to itself, an unlabeled bar chart). Every block now
// leads somewhere: continue the next lesson, quiz yourself on what you
// have learned, practise weak topics, jump into a subject, or revisit /
// re-quiz any completed lesson.
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";
import { formatPercent } from "../utils/format.js";
import { pluralize } from "../utils/text.js";
import { getLearningStatistics } from "../engines/progress-engine.js";
import { getAllProgress } from "../services/progress-service.js";
import { listSubjects, listLessons } from "../engines/subject-engine.js";
import { getTitleLookup } from "../services/lesson-title-service.js";
import {
  completedRecords, needsPractice, buildSubjectRows, learnedSubjectIds, learnedQuizHref,
  firstUnfinished, lessonHref, mcqHref, titleKey, normSub, sortRecent,
} from "../engines/progress-insights.js";
import { createProgressCard } from "../components/progress/progress-card.js";
import { createAchievementsList } from "../components/progress/achievements.js";

const LESSONS_COLLAPSED = 6;

function actionCard({ href, iconName, title, text, tone = "", disabled = false }) {
  return createEl("a", {
    href,
    class: `ou-card ou-card--interactive ou-action${tone ? ` ou-action--${tone}` : ""}${disabled ? " ou-action--soft" : ""}`,
  }, [
    createEl("span", { class: "ou-action__icon", "aria-hidden": "true" }, [icon(iconName)]),
    createEl("span", { class: "ou-action__body" }, [
      createEl("span", { class: "ou-action__title" }, [title]),
      createEl("span", { class: "ou-action__text" }, [text]),
    ]),
    icon("chevron-right", { class: "ou-action__chev" }),
  ]);
}

async function resolveContinue(records, subjectsById) {
  const last = sortRecent(records).find((r) => r.lastStudied);
  if (!last) return { href: "#/subjects", text: "Pick a subject and open your first lesson." };
  const subjectTitle = subjectsById.get(last.subjectId)?.title || "your subject";
  try {
    const ids = await listLessons(last.subjectId, normSub(last.subSubjectId) || undefined);
    const next = firstUnfinished(ids, last.subjectId, last.subSubjectId, records);
    if (next) {
      const sub = normSub(last.subSubjectId);
      const href = sub ? `#/subjects/${last.subjectId}/${sub}/lessons/${next}` : `#/subjects/${last.subjectId}/lessons/${next}`;
      return { href, text: `Next unfinished lesson in ${subjectTitle}.` };
    }
  } catch { /* fall through to the subject page */ }
  return { href: `#/subjects/${last.subjectId}`, text: `Browse what is left in ${subjectTitle}.` };
}

function subjectRow(row) {
  const pct = Math.round(row.ratio * 100);
  return createEl("a", { href: `#/subjects/${row.id}`, class: "ou-prog-row" }, [
    createEl("span", { class: "ou-prog-row__name" }, [row.title]),
    createEl("span", { class: "ou-prog-row__count ou-tabular-nums" }, [`${row.done} / ${row.total}`]),
    createEl("span", {
      class: "ou-progress-bar ou-prog-row__bar", role: "progressbar", "aria-label": `${row.title} progress`,
      "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct),
    }, [createEl("span", { class: "ou-progress-bar__fill", style: `--ou-progress:${row.ratio}` })]),
    icon("chevron-right", { class: "ou-prog-row__chev" }),
  ]);
}

function lessonRow(r, titles, subjectsById) {
  const title = titles.get(titleKey(r)) || r.lessonId;
  const subject = subjectsById.get(r.subjectId)?.title || r.subjectId;
  const scored = typeof r.score === "number";
  const weak = scored && r.score < 0.6;
  const badge = scored
    ? createEl("span", { class: `ou-badge-score${weak ? " is-weak" : " is-ok"}` }, [`${weak ? "Needs practice" : "Quiz"} · ${formatPercent(r.score)}`])
    : createEl("span", { class: "ou-badge-score" }, ["Not quizzed yet"]);
  return createEl("li", { class: "ou-lesson-row" }, [
    createEl("a", { href: lessonHref(r), class: "ou-lesson-row__main" }, [
      createEl("span", { class: "ou-lesson-row__title" }, [title]),
      createEl("span", { class: "ou-lesson-row__meta" }, [subject, badge]),
    ]),
    createEl("a", { href: mcqHref(r), class: "ou-btn ou-lesson-row__quiz", "aria-label": `${scored ? "Retake" : "Take"} quiz: ${title}` }, [
      icon(scored ? "rotate-right" : "list-check"), scored ? "Retake" : "Quiz",
    ]),
  ]);
}

export async function render(container, _params, nav = null) {
  document.title = "Your progress — OpenKnowledge";
  const [stats, records, subjects, titles] = await Promise.all([
    getLearningStatistics(), getAllProgress(), listSubjects().catch(() => []), getTitleLookup(),
  ]);
  if (nav?.stale) return;

  const subjectsById = new Map(subjects.map((s) => [s.id, s]));
  const totalLessons = subjects.reduce((sum, s) => sum + (s.lessonCount ?? 0), 0);
  const done = completedRecords(records);
  const weak = needsPractice(records);
  const learned = learnedSubjectIds(records);
  const cont = await resolveContinue(records, subjectsById);
  if (nav?.stale) return;

  // ── Hero: where you are ──
  const hero = createProgressCard(stats, totalLessons, { linked: false });

  const statTile = (iconName, value, label) => createEl("div", { class: "ou-stat" }, [
    icon(iconName, { class: "ou-stat__icon" }),
    createEl("div", { class: "ou-stat__value ou-tabular-nums" }, [value]),
    createEl("div", { class: "ou-stat__label" }, [label]),
  ]);
  const stat = createEl("div", { class: "ou-stat-row" }, [
    statTile("fire", String(stats.streak), stats.streak === 1 ? "day streak" : "day streak"),
    statTile("list-check", String(stats.mcqsAnswered), pluralize("quiz", stats.mcqsAnswered, "quizzes") + " taken"),
    statTile("bullseye", stats.mcqsAnswered ? formatPercent(stats.accuracy) : "—", "avg. accuracy"),
  ]);

  // ── What next ──
  const actions = [
    actionCard({
      href: cont.href, iconName: "play", tone: "primary",
      title: done.length ? "Continue learning" : "Start your first lesson", text: cont.text,
    }),
    actionCard({
      href: learned.length ? `#${learnedQuizHref(learned, 10)}` : "#/subjects", iconName: "brain",
      title: "Quiz me on what I learned",
      text: learned.length
        ? `10 questions mixed from ${learned.length} ${pluralize("subject", learned.length)} you have studied.`
        : "Finish a lesson first — then this builds a quiz from it.",
      disabled: !learned.length,
    }),
  ];
  if (weak.length) {
    actions.push(actionCard({
      href: mcqHref(weak[0]), iconName: "bolt", title: "Practise weak topics",
      text: `${weak.length} ${pluralize("lesson", weak.length)} scored under 60% — start with “${titles.get(titleKey(weak[0])) || weak[0].lessonId}”.`,
    }));
  }
  actions.push(actionCard({
    href: "#/mock-tests", iconName: "clipboard-list", title: "Take a full mock test",
    text: "Timed, exam-style papers across subjects.",
  }));

  // ── Subjects ──
  const rows = buildSubjectRows(subjects, records);
  const started = rows.filter((r) => r.done > 0);
  const subjectsBlock = createEl("section", { class: "ou-prog-section" }, [
    createEl("h2", {}, ["Progress by subject"]),
    createEl("div", { class: "ou-card ou-prog-list" }, (started.length ? started : rows.slice(0, 5)).map(subjectRow)),
    started.length && started.length < rows.length
      ? createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
          `${rows.length - started.length} more ${pluralize("subject", rows.length - started.length)} not started — `,
          createEl("a", { href: "#/subjects", class: "ou-link" }, ["browse all subjects"]),
        ])
      : null,
  ]);

  // ── Completed lessons ──
  let lessonsBlock;
  if (!done.length) {
    lessonsBlock = createEl("section", { class: "ou-prog-section" }, [
      createEl("h2", {}, ["Your lessons"]),
      createEl("div", { class: "ou-card ou-prog-empty" }, [
        createEl("p", {}, ["Lessons you complete appear here, each with a one-tap quiz so you can test what you have learned."]),
        createEl("a", { href: "#/subjects", class: "ou-btn ou-btn--primary" }, [icon("book-open"), "Browse subjects"]),
      ]),
    ]);
  } else {
    const list = createEl("ul", { class: "ou-lesson-list", role: "list" });
    const paint = (all) => {
      list.replaceChildren(...(all ? done : done.slice(0, LESSONS_COLLAPSED)).map((r) => lessonRow(r, titles, subjectsById)));
    };
    paint(false);
    const more = done.length > LESSONS_COLLAPSED
      ? createEl("button", {
          type: "button", class: "ou-btn ou-lesson-more", "aria-expanded": "false",
          on: { click: (e) => {
            const open = e.currentTarget.getAttribute("aria-expanded") === "true";
            paint(!open);
            e.currentTarget.setAttribute("aria-expanded", String(!open));
            e.currentTarget.textContent = open ? `Show all ${done.length}` : "Show fewer";
          } },
        }, [`Show all ${done.length}`])
      : null;
    lessonsBlock = createEl("section", { class: "ou-prog-section" }, [
      createEl("h2", {}, ["Your lessons"]),
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, ["Tap a lesson to review it, or take its quiz to check what stuck."]),
      list, more,
    ]);
  }

  mount(container, createEl("div", { class: "ou-container ou-stack ou-prog" }, [
    createEl("h1", {}, ["Your progress"]),
    hero,
    stat,
    createEl("section", { class: "ou-prog-section" }, [
      createEl("h2", {}, ["What next?"]),
      createEl("div", { class: "ou-action-grid" }, actions),
    ]),
    subjectsBlock,
    lessonsBlock,
    createEl("section", { class: "ou-prog-section" }, [
      createEl("h2", {}, ["Achievements"]),
      createAchievementsList(stats),
    ]),
  ]));
}
