// src/components/subject/subject-card.js — icon badge + title + footer
// meta row, matching the reference design. Colors/icons are assigned
// deterministically per subject id (falling back to a rotating palette
// for anything not in the known list) since the content registry doesn't
// carry that metadata.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { pluralize } from "../../utils/text.js";

const KNOWN = {
  science: { iconName: "circle-nodes", color: "#34c759" },
  mathematics: { iconName: "circle-play", color: "#0071e3" },
  "computer-science": { iconName: "laptop", color: "#5ac8fa" },
  history: { iconName: "landmark", color: "#ff9500" },
  geography: { iconName: "earth-americas", color: "#ff2d55" },
  economics: { iconName: "chart-line", color: "#30b0c7" },
  philosophy: { iconName: "brain", color: "#af52de" },
  languages: { iconName: "language", color: "#ff9500" },
};
const FALLBACK_PALETTE = ["#0071e3", "#34c759", "#af52de", "#ff9500", "#ff2d55", "#5ac8fa"];

function styleFor(subjectId) {
  if (KNOWN[subjectId]) return KNOWN[subjectId];
  let hash = 0;
  for (const ch of subjectId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return { iconName: "book", color: FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length] };
}

export function createSubjectCard(subject) {
  const { iconName, color } = styleFor(subject.id);
  const lessonCount = subject.lessonCount ?? null;

  return createEl("a", { href: `#/subjects/${subject.id}`, class: "ou-card ou-card--interactive ou-subject-card" }, [
    createEl("div", {}, [
      createEl("div", {
        class: "ou-subject-card__icon",
        style: `background:color-mix(in srgb, ${color} 12%, transparent); color:${color};`,
      }, [icon(iconName)]),
      createEl("div", { class: "ou-card__title" }, [subject.title]),
      subject.description
        ? createEl("div", { class: "ou-card__subtitle" }, [subject.description])
        : null,
    ]),
    createEl("div", { class: "ou-subject-card__footer" }, [
      lessonCount !== null
        ? createEl("span", {}, [icon("book-open"), ` ${lessonCount} ${pluralize("lesson", lessonCount)}`])
        : createEl("span", {}, [icon("book-open"), " Explore"]),
    ]),
  ]);
}
