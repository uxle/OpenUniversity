// src/utils/icons.js — Font Awesome 6 Free (solid) icon registry.
//
// History, because it explains the design:
//   1. The app pulled fa all.min.css + webfonts from the cdnjs CDN — its
//      ONLY runtime network dependency (≈100 KB CSS + webfonts), which
//      flashed unstyled icons on slow links and broke the works-offline /
//      file:// promise.
//   2. That was replaced with an inline Lucide-style SVG set (~35 glyphs,
//      zero network). Visually fine, but stroke-outline icons read thin
//      next to this app's heavy 700-weight headings, and the set drifted
//      from FA's shapes users know.
//   3. Current state (this file + tools/build-icon-font.py): Font Awesome
//      6 Free **solid** again, but SELF-HOSTED and SUBSETTED — the build
//      script reads the names below, resolves their codepoints from the
//      official FA CSS, and subsets fa-solid-900 to just those glyphs
//      (≈420 KB TTF → a few KB woff2 in public/fonts/). No CDN, no flash,
//      offline-safe, real fa-solid glyphs.
//
// This module is the single source of truth for WHICH icons exist:
//   - ICON_NAMES: canonical FA6 free-solid names used by the app.
//   - ALIASES: legacy/Lucide-era names callers still pass → canonical
//     names (also covers the Material-Symbols names the vendored Zolto
//     renderer can emit for @alert/@card icons — mapped to the nearest
//     FA solid glyph by the vendor-icon shim in utils/vendor-icons.js).
// Call sites go through icon() in icon.js; nothing else imports here.
//
// Adding an icon: add its real FA6 free-solid name to ICON_NAMES, re-run
// `python3 tools/build-icon-font.py`, done (the build fails loudly if the
// name doesn't exist in FA, so typos can't ship).

export const ICON_NAMES = [
  /* navigation & chrome */
  "house", "book", "book-open", "compass", "magnifying-glass", "ellipsis",
  "chevron-left", "chevron-right", "chevron-down", "chevron-up",
  "arrow-up", "arrow-right", "xmark", "terminal", "bars",
  /* subjects */
  "landmark", "laptop", "earth-americas", "chart-line", "brain",
  "language", "circle-nodes", "circle-play", "play",
  /* learning actions */
  "bookmark", "note-sticky", "pen", "trash", "file-pdf", "trophy",
  "fire", "graduation-cap", "clock", "wand-magic-sparkles",
  /* status & meta */
  "circle-info", "circle-question", "circle-check", "circle-xmark",
  "circle-exclamation", "circle-pause", "circle", "triangle-exclamation",
  "check", "inbox",
  /* account & settings */
  "user", "gear", "code-branch", "unlock", "align-left",
  /* theme */
  "sun", "moon",
  /* vendor-shim extras (Material-Symbols names → FA equivalents) */
  "ban", "hourglass-half", "terminal", "code", "calculator",
  "arrow-trend-up", "lightbulb", "bullseye", "flag", "star", "bolt",
  "key", "lock", "shield-halved", "map", "flask", "plug-circle-xmark",
];

/** Old / foreign-framework names → canonical FA6 free-solid names. */
export const ALIASES = {
  /* Lucide-era names kept for call-site compatibility */
  home: "house",
  search: "magnifying-glass",
  close: "xmark",
  warning: "triangle-exclamation",
  info: "circle-info",
  settings: "gear",
  sticky: "note-sticky",
  languageSwitch: "language",
  houseCircle: "circle-info",
  /* app-era names that don't exist in FA6 free → nearest solid glyph */
  "language-switch": "language",
  command: "terminal",
  sparkles: "wand-magic-sparkles",
  "wifi-slash": "plug-circle-xmark", /* wifi-slash is FA Pro-only */
  /* Material-Symbols names the vendored Zolto renderer emits
     (see zolto/vendor/zolto/directive-renderer.js ALERT_ICONS etc.) */
  check_circle: "circle-check",
  error: "circle-exclamation",
  sticky_note_2: "note-sticky",
  person: "user",
  cancel: "ban",
  block: "ban",
  pending: "circle-pause",
  hourglass_empty: "hourglass-half",
  schedule: "clock",
  menu_book: "book-open",
  auto_stories: "book-open",
  psychology: "brain",
  quiz: "circle-question",
  emoji_events: "trophy",
  local_fire_department: "fire",
  school: "graduation-cap",
  public: "earth-americas",
  globe: "earth-americas",
  functions: "code",
  calculate: "calculator",
  timeline: "chart-line",
  trending_up: "arrow-trend-up",
  target: "bullseye",
  science: "flask",
  shield: "shield-halved",
};

const CANONICAL = new Set(ICON_NAMES);

/**
 * Resolve any legacy/alias name to its canonical FA class suffix.
 * @param {string} name
 * @returns {string|null} canonical name, or null when unknown
 */
export function resolveIconName(name) {
  if (typeof name !== "string" || !name) return null;
  const canonical = ALIASES[name] ?? name;
  return CANONICAL.has(canonical) ? canonical : null;
}

/** All canonical icon names (useful for tooling/tests). */
export function iconNames() {
  return [...ICON_NAMES];
}
