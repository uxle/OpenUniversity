// src/components/lesson/export-pdf-button.js — "Export as PDF".
//
// Deliberately uses window.print() + src/styles/print.css rather than a
// client-side PDF library (jsPDF etc.): it needs zero dependencies, works
// in every browser, can't silently produce a broken file, and lets the
// OS "Save as PDF" print destination do the actual PDF generation. The
// tradeoff is a print dialog instead of an instant download — worth it
// for something this environment can't test against a real CDN import.

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

export function createExportPdfButton() {
  return createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary",
    on: { click: () => window.print() },
  }, [icon("file-pdf"), createEl("span", {}, ["Export as PDF"])]);
}
