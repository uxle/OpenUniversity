// src/components/subject/subject-identity.js — per-subject icon + pastel
// accent class, shared by the subject cards (home grid) and the subject
// page header chip so both always match.
//
// Color is OPTIONAL decoration ("Ink & Accent" palette): black & white
// carry the identity, and each known subject gets ONE soft pastel applied
// via a CSS class (see src/styles/components/accents.css) — never inline
// styles — so light/dark themes recolor automatically. Unknown subjects
// fall back to the neutral ink badge; the app never breaks without color.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

const KNOWN_ICONS = {
  science: "circle-nodes",
  mathematics: "circle-play",
  "computer-science": "laptop",
  history: "landmark",
  geography: "earth-americas",
  economics: "chart-line",
  philosophy: "brain",
  languages: "language",
  civics: "user",
  reasoning: "code-branch",
};

/**
 * @param {string} subjectId
 * @returns {{ iconName: string, hueClass: string }} hueClass is "" for
 *   unknown subjects → callers render the neutral ink badge instead.
 */
export function subjectIdentity(subjectId) {
  const iconName = KNOWN_ICONS[subjectId] || "book";
  const hueClass = KNOWN_ICONS[subjectId] ? `ou-hue-${subjectId}` : "";
  return { iconName, hueClass };
}

/**
 * Round pastel icon badge for a subject. Pass extraClass to size it
 * (e.g. card badge vs. header chip icon).
 */
export function subjectBadge(subjectId, extraClass = "") {
  const { iconName, hueClass } = subjectIdentity(subjectId);
  const classes = ["ou-subject-card__icon", ...extraClass.split(" ").filter(Boolean)];
  if (hueClass) classes.push(hueClass);
  return createEl("div", { class: classes.join(" "), "data-subject": subjectId }, [icon(iconName)]);
}
