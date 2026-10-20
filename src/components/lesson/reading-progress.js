// src/components/lesson/reading-progress.js — thin scroll-progress bar
// pinned under the header on lesson pages.
//
// Why transform, not width: width triggers layout on every scroll frame;
// scaleX is compositor-only (the same reasoning the progress rings already
// follow — see README's UI/UX checklist notes). rAF-throttled because the
// scroll event itself fires far more often than frames.
//
// Self-cleaning: the listener checks `bar.isConnected` and removes itself
// once the route swap has destroyed the bar — no external teardown API to
// forget calling.

import { createEl } from "../../utils/dom.js";

export function createReadingProgress(target) {
  const bar = createEl("div", {
    class: "ou-reading-progress",
    role: "progressbar",
    "aria-label": "Reading progress",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": "0",
  });
  const fill = createEl("div", { class: "ou-reading-progress__fill" });
  bar.appendChild(fill);

  let ticking = false;

  function update() {
    ticking = false;
    if (!bar.isConnected) {
      window.removeEventListener("scroll", onScroll);
      return;
    }
    const el = target && target.isConnected ? target : bar.parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const ratio = Math.min(1, scrolled / total);
    fill.style.transform = `scaleX(${ratio})`;
    bar.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    bar.classList.toggle("ou-reading-progress--visible", ratio > 0.02);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  // Measure once after fonts/content settle, then on resize.
  requestAnimationFrame(update);
  window.addEventListener("resize", onScroll, { passive: true });

  return bar;
}
