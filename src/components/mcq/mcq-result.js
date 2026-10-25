// src/components/mcq/mcq-result.js — results hero: ring, copy, stats,
// per-topic bars and ONE adaptive primary action (Practise N missed, or
// Try again on a perfect score).
import { createEl } from "../../utils/dom.js";
import { createButton } from "../common/button.js";
import { icon } from "../../utils/icon.js";
import { messageFor } from "../../engines/quiz-session.js";

const R = 52, C = 2 * Math.PI * R;
const NS = "http://www.w3.org/2000/svg";

function ring(percent) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("aria-hidden", "true");
  for (const cls of ["ou-ring__track", "ou-ring__fill"]) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("class", cls); c.setAttribute("cx", "60"); c.setAttribute("cy", "60"); c.setAttribute("r", String(R));
    if (cls.endsWith("fill")) {
      c.style.strokeDasharray = String(C);
      c.style.strokeDashoffset = String(C);
      requestAnimationFrame(() => requestAnimationFrame(() => { c.style.strokeDashoffset = String(C * (1 - percent / 100)); }));
    }
    svg.appendChild(c);
  }
  return svg;
}

export function createMcqResult(summary, topics, { onPractiseMissed, onRetry, onReview, onExport, onRetakeAll, lessonHref = null, isSubset = false } = {}) {
  const msg = messageFor(summary);
  const stat = (v, l, cls) => createEl("div", { class: "ou-mcq-stat" }, [
    createEl("div", { class: `ou-mcq-stat__v ou-tabular-nums ${cls}` }, [String(v)]),
    createEl("div", { class: "ou-mcq-stat__l" }, [l]),
  ]);
  return createEl("div", { class: "ou-mcq-result ou-mcq-result--v2 ou-stack" }, [
    createEl("div", { class: "ou-mcq-hero" }, [
      createEl("div", { class: "ou-ring", role: "img", "aria-label": `Score: ${summary.percent} percent` }, [
        ring(summary.percent),
        createEl("div", { class: "ou-ring__center" }, [
          createEl("span", { class: "ou-ring__pct ou-tabular-nums" }, [`${summary.percent}%`]),
          createEl("span", { class: "ou-ring__cap" }, [isSubset ? "practice" : "accuracy"]),
        ]),
      ]),
      createEl("div", {}, [
        createEl("h2", { class: "ou-mcq-hero__title", tabindex: "-1", id: "ou-mcq-result-title" }, [msg.head]),
        createEl("p", { class: "ou-mcq-hero__sub" }, [msg.sub]),
      ]),
    ]),
    createEl("div", { class: "ou-mcq-stats" }, [
      stat(summary.correct, "Correct", "is-ok"),
      stat(summary.incorrect, "Missed", "is-bad"),
      stat(summary.skipped, "Skipped", "is-skip"),
      stat(summary.total, "Total", ""),
    ]),
    topics.length ? createEl("div", { class: "ou-card ou-mcq-topics" }, [
      createEl("div", { class: "ou-card__title" }, ["By topic · weakest first"]),
      createEl("ul", { class: "ou-mcq-topics__list", role: "list" }, topics.map((t) => createEl("li", {}, [
        createEl("div", { class: "ou-mcq-topics__row" }, [
          createEl("span", {}, [t.topic]),
          createEl("span", { class: "ou-tabular-nums" }, [`${t.correct}/${t.total} · ${t.accuracy}%`]),
        ]),
        createEl("div", { class: "ou-progress-bar", role: "img", "aria-label": `${t.topic}: ${t.accuracy} percent` }, [
          createEl("div", { class: "ou-progress-bar__fill", style: `--ou-progress:${t.accuracy / 100}` }),
        ]),
      ]))),
    ]) : null,
    createEl("div", { class: "ou-mcq-result__actions" }, [
      summary.missed > 0
        ? createButton({ label: `Practise ${summary.missed} missed`, icon: icon("rotate-right"), onClick: onPractiseMissed })
        : createButton({ label: "Try again", icon: icon("rotate-right"), onClick: onRetry }),
      summary.missed > 0 ? createButton({ label: "Review answers", variant: "secondary", icon: icon("list-check"), onClick: onReview }) : null,
      summary.missed > 0 && lessonHref
        ? createEl("a", { class: "ou-btn ou-btn--secondary", href: lessonHref }, [icon("book-open"), "Learn it in the lesson"])
        : null,
      createButton({ label: "Export results", variant: "secondary", onClick: onExport }),
      isSubset || summary.missed > 0
        ? createButton({ label: isSubset ? "Back to all questions" : "Retake all", variant: "ghost", onClick: onRetakeAll || onRetry })
        : null,
    ]),
  ]);
}
