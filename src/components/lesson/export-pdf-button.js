// src/components/lesson/export-pdf-button.js — "Export as PDF".
//
// Generates a true vector PDF of the LESSON ONLY (no quiz CTA, related
// lessons, notes or app chrome) plus the lesson's full MCQ practice set
// and answer key, via the zero-dependency writer in src/pdf/. Text is
// emitted as real text and shapes as paths, so the file can never
// pixelate. Progress is reflected on the button; failures surface as
// toasts. (The browser's own Ctrl+P still prints the page — that path is
// styled by print.css.)

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { showToast } from "../common/toast.js";
import { exportLessonPdf } from "../../pdf/export-lesson-pdf.js";

export function createExportPdfButton({ subjectId, subSubjectId, lessonId, lang = "en" } = {}) {
  const label = createEl("span", {}, ["Export as PDF"]);
  const button = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary",
    on: { click: () => run() },
  }, [icon("file-pdf"), label]);

  async function run() {
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    label.textContent = "Building PDF…";
    try {
      const { filename } = await exportLessonPdf(
        { subjectId, subSubjectId, lessonId, lang },
        (stage) => {
          if (stage === "mcq") label.textContent = "Adding practice questions…";
          else if (stage === "compose") label.textContent = "Laying out pages…";
          else if (stage === "save") label.textContent = "Saving…";
        }
      );
      showToast(`Saved ${filename}`, "success", { title: "PDF ready" });
    } catch (err) {
      showToast(`PDF export failed (${err.message}).`, "error", { title: "Export failed" });
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      label.textContent = "Export as PDF";
    }
  }

  return button;
}
