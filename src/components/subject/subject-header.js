// src/components/subject/subject-header.js — pastel icon chip (eyebrow)
// + title + description. The chip reuses the exact badge shown on the
// subject cards (subject-identity.js), so a subject looks the same
// everywhere: cute pastel accent on the icon, monochrome everywhere else.
import { createEl } from "../../utils/dom.js";
import { pluralize } from "../../utils/text.js";
import { subjectBadge } from "./subject-identity.js";

export function createSubjectHeader(subject) {
  const lessonCount = subject.lessonCount ?? null;

  return createEl("div", { class: "ou-stack" }, [
    createEl("div", { class: "ou-subject-chip" }, [
      subjectBadge(subject.id),
      createEl("span", {}, [
        lessonCount !== null
          ? `${lessonCount} ${pluralize("lesson", lessonCount)}`
          : "Subject",
      ]),
    ]),
    createEl("h1", {}, [subject.title]),
    subject.description ? createEl("p", { class: "ou-text-secondary" }, [subject.description]) : null,
  ]);
}
