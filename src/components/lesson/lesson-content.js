// src/components/lesson/lesson-content.js — mounts Zolto's compiled HTML.
// Zolto's compile() output is already sanitized HTML (per its docs); we
// still isolate it in its own container so zolto-content.css can scope
// styling to compiled output specifically.
//
// enhanceLessonMedia() runs the mobile-robustness pass on the mounted
// subtree: wide diagrams become horizontally pannable instead of
// shrinking to unreadable text, and the vendored renderer's
// Material-Symbols ligature spans are rewritten to real fa-solid glyphs
// (that font was never loaded — lessons with @alert/@card icons used to
// show the literal word "info" instead of a glyph). See utils/lesson-media.js.
import { createEl } from "../../utils/dom.js";
import { enhanceLessonMedia } from "../../utils/lesson-media.js";

export function createLessonContent(html) {
  const container = createEl("div", { class: "ou-lesson-content" });
  container.innerHTML = html;
  enhanceLessonMedia(container);
  return container;
}
