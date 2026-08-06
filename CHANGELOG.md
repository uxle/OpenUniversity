# Changelog

All notable changes to this project are documented here.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed — UI/UX overhaul (based on a supplied reference design)
- Removed the persistent desktop sidebar and CSS-grid shell entirely.
  Single layout at every screen width now: sticky minimal header (brand +
  a "more" menu for secondary pages + theme toggle) and a floating,
  blurred bottom nav (Home/Subjects/Search/Progress) always visible, not
  just on mobile. This was also the root cause of most of a prior mobile
  bug report — removing the complexity removed the bug class.
- New color/spacing/radius tokens matching the reference (near-white app
  background distinct from white cards, rgba-based adaptive borders,
  softer layered shadows, bigger rounding). Typography now uses one fluid
  *root* font-size (`clamp()` on `html`) instead of clamping every size
  token individually — simpler and easier to maintain.
- Subject cards redesigned with colored icon badges and a footer meta
  row; search filters are now horizontally-scrollable pills instead of a
  `<select>`; the lesson reader uses a card with a subject badge, a
  "← Back" link instead of a breadcrumb, and quote-box-styled admonitions.
- Home page now shows onboarding quick-action cards when there's no
  progress yet, and distinguishes "the subject registry failed to load"
  from "genuinely zero subjects" — each gets its own message and a real
  retry/CTA action instead of one generic blank state.
- Fixed low-contrast text: several places used the lightest text tier for
  primary readable content (empty-state messages, error text) instead of
  the darker secondary tier — hard to read, exactly as reported.

### Fixed — found via real Playwright testing of the new layout (19 checks)
- Icon-only buttons (theme toggle, etc.) measured 18–24px in practice —
  the 44px touch-target rule was gated behind `@media (pointer: coarse)`,
  which isn't reliably reported by every mobile browser. Now unconditional.
- The header's "more" menu never closed on route navigation (the header
  persists across routes; only `<main>` swaps) — once opened, it silently
  sat on top of whatever page loaded next and blocked clicks there with
  no visible indication why. Now closes on route change and Escape.
- Footer/bottom-nav overlap: `<main>` had `flex:1` *and* its own
  padding-bottom meant to reserve space above the fixed nav — but padding
  on a flex-grown element doesn't change its grown size, so the reserved
  space was inset *inside* main's box, not actually pushing the footer
  down. The footer could render with its text directly behind the fixed
  nav on short pages. Fixed by removing `flex:1` and moving nav-clearance
  padding to the footer itself, the true last element before the nav.

### Fixed — real bug reported from a real device
- `src/app/routes.js` used to import all 15 pages via one `Promise.all`
  at startup — if a single page (or anything it imports) failed to load
  for any reason (a stale/incomplete file extraction, a typo, a missing
  file), the *entire app* failed to start, not just that page. This is
  exactly what happened: `lesson-engine.js` 404'd on a real deploy and
  took down navigation, the header, everything.
  Rewritten so each page is imported lazily, on first visit to its route,
  wrapped in its own try/catch. A broken page now shows a specific
  "this page couldn't load" message on just that route — the rest of the
  app keeps working. Verified by deliberately deleting `lesson-engine.js`
  and confirming only the lesson route fails now.

### Added — mobile-first, liquid typography & layout
- Type scale (`--ou-fs-*`) and larger spacing tokens (`--ou-space-3`
  through `--ou-space-7`) now use `clamp()` so they scale continuously
  with viewport width instead of jumping at fixed breakpoints.
- `layout.css`, `responsive.css`, and `navbar.css` rewritten mobile-first:
  base rules are the phone layout (single column, icon-only nav, mobile
  tab bar); `min-width: 900px` layers the two-column desktop shell on
  top, rather than the reverse.
- `.ou-container` and `.ou-grid` use fluid `min()`/`minmax()` sizing so
  width and column count reflow continuously, not just at breakpoints.
- Automatic, reduced-motion-respecting page-transition and staggered
  card-grid animations (pure CSS — animations run on element insertion,
  no JS needed).

## [Unreleased]

### Added (this pass)
- Renamed the project to **OpenKnowledge** ("knowledge is everyone's right") —
  README, package.json, page titles, header/footer updated; real repo
  links to `github.com/uxle/OpenUniversity` deliberately left unchanged.
- Real app shell: `index.html` now boots `src/app/bootstrap.js`
  (persistent header/sidebar/footer/mobile-nav around a route outlet)
  instead of the old MCQ-only demo page.
- Per-lesson translation: language switcher, graceful fallback-with-notice
  when a translation doesn't exist, and a real, complete Hindi translation
  of the Physics/Motion lesson + its quiz as a working demo.
- Export as PDF via `window.print()` + a dedicated print stylesheet
  (verified in print-media emulation, not just that the button works).
- Font Awesome Free (solid) icons throughout the app via a shared,
  accessibility-aware `utils/icon.js` helper; `mcq-engine.js` deliberately
  exempted (stays zero-dependency).
- Logo wired into the header as `<img src="assets/branding/logo.svg">` —
  file content untouched, ready to be replaced.
- A UI/UX pass against a supplied `AGENTS.txt` checklist — see README
  Status for the specific items addressed.
- A static import/export checker (`gen/21_check_exports.py`, not part of
  the shipped repo) written after finding a real missing-export bug, to
  catch the same class of bug going forward.

### Fixed (found via real Playwright/Chromium testing, not just review)
- `zolto-engine.js`'s bare `import ... from "zolto"` doesn't resolve in
  browsers without an import map — was crashing the entire app on load.
  Fixed via `<script type="importmap">` in `index.html`.
- `engines/progress-engine.js` didn't export `getLessonProgress`, which
  `pages/lesson.js` imported — another whole-app-crashing `SyntaxError`.
- MCQ answer handling called `classList.add("")` for unselected wrong
  options, which throws and silently broke scoring.
- Sidebar wrapper and the `<aside>` inside it duplicated the same CSS
  grid-area class.
- Removed an unverifiable Font Awesome SRI `integrity` hash rather than
  ship one that might be wrong (a wrong hash blocks the whole stylesheet).

### Added (earlier)
- Full CSS design system: 30 files covering tokens, reset, typography,
  responsive layout, three themes (light/dark/high-contrast), and every
  component/lesson/mcq/search/account style.
- Real implementations for all 138 previously-stubbed JS files (109 app
  code + 29 tests/tools), covering `app/`, `core/`, `utils/`, `storage/`,
  `accessibility/`, `i18n/`, `services/`, `engines/` (excluding the Zolto
  internals, intentionally left as-is — see below), `components/` (57
  files), and `pages/` (15 files).
- `tools/generate-registry.js` and `tools/build-search-index.js` — real,
  runnable scripts that scan `src/subjects/` and produce the registry and
  search index (verified against a scratch copy of the repo).
- `tools/validate-content.js`, `check-links.js`, `check-duplicates.js` —
  run clean against the current repo. `tools/validate-zolto.js` correctly
  errors with a clear message until `zolto` is installed.
- Real test suite (`tests/**/*.test.js`, `node --test`): 17 tests, 16
  passing, 1 skipped pending `npm install` — covers the validator, MCQ
  schema conformance (including a scan of every real `*mcq.json`), search
  scoring, and streak calculation.
- Initial project scaffold matching `tree.md`.
- Working `MCQEngine` (`src/engines/mcq-engine.js`) — self-contained,
  dependency-free multiple-choice quiz renderer with instant feedback,
  rationale display, and scoring.
- Sample subject content: Science → Physics → "Introduction to Motion",
  with a matching MCQ.
- Draft JSON Schemas for subject, sub-subject, lesson, and MCQ content.
- `src/engines/zolto/zolto-engine.js` — real adapter around the actual
  `zolto` npm package (`compileLesson`, `parseLesson`, `renderLesson`,
  plus pass-through to Zolto's Phase 10 interactive/`@quiz` engine).
- `src/engines/zolto/README.md` explaining that the sibling
  parser/lexer/renderer/etc. stub files are superseded by the real
  package and don't need hand-built implementations.

### Changed
- `search-service.js`, `bookmark-service.js`, and `progress-service.js`
  refactored to accept optional injected data, so their core logic is
  unit-testable without a browser (no fetch/IndexedDB needed in tests).
- `package.json`'s `test` script fixed to `node --test tests/**/*.test.js`
  (plain `tests/` doesn't recurse on this Node version).
- README's MCQ JSON example updated to match the shipped engine's actual
  field names (`correct` / `rationale`) instead of the earlier placeholder
  names (`answer` / `explanation`).
- `lesson1.zl` and its README example rewritten to use Zolto's real,
  documented syntax — Phase 2 admonitions `[definition]` / `[important]`
  and Phase 4 block math `@math ... @/math` — verified against Zolto's
  own `SPECIFICATION.md`. Previously used invented directives
  (`@definition { }`, `@equation { }`) that don't exist in Zolto.

### Known issues
- `index.html` still boots the standalone MCQ demo, not the new
  `src/app/bootstrap.js` app shell — they haven't been wired together yet.
- The Zolto adapter is untested end-to-end — this environment has no
  network access, so `npm install` couldn't be run here. Syntax-checked
  only.
- Zolto's native `@quiz`/`@mcq` interactive syntax overlaps with
  OpenKnowledge's separate JSON-based MCQ engine. Not reconciled —
  see the note in `zolto-engine.js`.
- Only Science → Physics → "Introduction to Motion" has real lesson
  content; the other 30 lesson/MCQ slots are still placeholders.
