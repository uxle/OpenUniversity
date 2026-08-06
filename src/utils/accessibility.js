// src/utils/accessibility.js — small a11y helpers shared by components
// and src/accessibility/*.

export function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prefersHighContrast() {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-contrast: more)").matches;
}

/** Focusable-element query, used by focus-manager.js and keyboard.js. */
export const FOCUSABLE_SELECTOR = [
  "a[href]", "button:not([disabled])", "input:not([disabled])",
  "select:not([disabled])", "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}
