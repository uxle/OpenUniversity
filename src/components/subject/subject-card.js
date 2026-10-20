// src/components/subject/subject-card.js — icon badge + title + footer
// meta row, matching the reference design. "Ink & Accent" palette: black
// & white carry the identity; each known subject gets ONE soft pastel on
// its icon badge only (class-based, see components/accents.css) — title,
// description and card chrome stay monochrome so nothing competes with
// the content. Unknown subjects keep the neutral ink badge.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { pluralize } from "../../utils/text.js";
import { subjectBadge } from "./subject-identity.js";

export function createSubjectCard(subject) {
  const lessonCount = subject.lessonCount ?? null;

  return createEl("a", { href: `#/subjects/${subject.id}`, class: "ou-card ou-card--interactive ou-subject-card" }, [
    createEl("div", {}, [
      subjectBadge(subject.id),
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
