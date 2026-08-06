// src/accessibility/screen-reader.js — shared aria-live announcer.

import { createEl } from "../utils/dom.js";

let politeRegion = null;
let assertiveRegion = null;

function ensureRegions() {
  if (!politeRegion) {
    politeRegion = createEl("div", { class: "ou-visually-hidden", "aria-live": "polite", "aria-atomic": "true" });
    document.body.appendChild(politeRegion);
  }
  if (!assertiveRegion) {
    assertiveRegion = createEl("div", { class: "ou-visually-hidden", "aria-live": "assertive", "aria-atomic": "true" });
    document.body.appendChild(assertiveRegion);
  }
}

/** @param {string} message @param {"polite"|"assertive"} [politeness] */
export function announce(message, politeness = "polite") {
  ensureRegions();
  const region = politeness === "assertive" ? assertiveRegion : politeRegion;
  region.textContent = "";
  // Force a DOM mutation so repeated identical messages are still announced.
  requestAnimationFrame(() => { region.textContent = message; });
}
