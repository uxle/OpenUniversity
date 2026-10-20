// src/utils/prefetch.js — speculative resource warming.
//
// Prefetching strategy:
// - On mouseenter/touchstart of a lesson link, speculatively import the
//   lesson page module (which is already cached on the 2nd visit, but this
//   warms it on the 1st). We also kick off the lesson source fetch so the
//   network round-trip has already started (or completed) by the time the
//   user's click fires the router.
// - A 80ms delay guards against accidental hover (e.g. moving cursor
//   across the list). It must be short enough to be useful on intentional
//   hover but long enough to avoid wasting bandwidth on flyover.
// - All errors are silently swallowed — prefetching is best-effort.

const HOVER_DELAY_MS = 80;

// Track URLs already prefetched so repeated hovers skip the timer setup.
const prefetched = new Set();

/**
 * Wire hover-prefetch onto a DOM element that links to a lesson.
 *
 * @param {HTMLElement} el          The anchor or card element.
 * @param {() => void}  warmFn      Called after HOVER_DELAY_MS — do the fetch.
 */
export function addHoverPrefetch(el, warmFn) {
  let timer = null;

  function start() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      warmFn();
    }, HOVER_DELAY_MS);
  }

  function cancel() {
    clearTimeout(timer);
    timer = null;
  }

  el.addEventListener("mouseenter", start, { passive: true });
  el.addEventListener("touchstart",  start, { passive: true });
  el.addEventListener("mouseleave",  cancel, { passive: true });
  el.addEventListener("touchend",    cancel, { passive: true });
}

/**
 * Prefetch a lesson: warm the JS module + the lesson source file.
 * Safe to call multiple times for the same key — deduped.
 *
 * @param {string} lessonSourceUrl   Full URL to the .zl file (from config).
 */
export function prefetchLesson(lessonSourceUrl) {
  if (prefetched.has(lessonSourceUrl)) return;
  prefetched.add(lessonSourceUrl);

  // Warm the lesson page module (dynamic import caches its result).
  import("../pages/lesson.js").catch(() => {});

  // Warm the lesson source file via a low-priority fetch.
  if (typeof fetch === "function") {
    fetch(lessonSourceUrl, { priority: "low" }).catch(() => {});
  }
}

/**
 * Prefetch the subject registry — shared across all lesson pages,
 * always beneficial to warm early.
 */
export function prefetchRegistry(registryUrl) {
  if (prefetched.has(registryUrl)) return;
  prefetched.add(registryUrl);
  if (typeof fetch === "function") {
    fetch(registryUrl, { priority: "low" }).catch(() => {});
  }
}
