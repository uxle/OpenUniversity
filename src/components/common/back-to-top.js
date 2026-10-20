// src/components/common/back-to-top.js — floating button, appears after
// real scrolling on any page. Compositor-friendly (transform for the
// show/hide), honors reduced-motion, self-contained: no teardown needed
// because it lives in the persistent shell, not the route outlet.

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

const SHOW_AFTER = 600;

export function createBackToTop() {
  const btn = createEl("button", {
    class: "ou-back-to-top",
    type: "button",
    "aria-label": "Back to top",
    hidden: true,
    on: {
      click: () => {
        const reduced = document.documentElement.dataset.a11yReducedMotion === "true";
        window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      },
    },
  }, [icon("arrow-up")]);

  let ticking = false;
  function update() {
    ticking = false;
    const show = window.scrollY > SHOW_AFTER;
    btn.hidden = !show;
    btn.classList.toggle("ou-back-to-top--visible", show);
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();

  return btn;
}
