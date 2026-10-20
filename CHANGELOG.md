# Changelog

All notable changes to this project are documented here.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added — Font Awesome solid icons, self-hosted
- Icons are Font Awesome 6 Free **solid** again, but without the old CDN dependency:
  `tools/build-icon-font.py` subsets `fa-solid-900` to the ~66 glyphs the app uses
  (~420 KB TTF → ~6 KB woff2 at `public/fonts/fa-solid-900.min.woff2`) and generates
  `src/styles/vendor/fa-solid.css`; the font is preloaded and precached by the
  service worker, so icons work offline and from `file://`.
- `src/utils/icons.js` is now the single icon registry (canonical names + aliases for
  every legacy name and the Material-Symbols names the vendored Zolto renderer emits);
  `src/utils/icon.js` emits `<i class="fa-solid fa-…">` with the same accessibility
  contract as before. `tools/check-icons.js` fails CI if any call site stops resolving.

### Fixed — mobile UI/UX (deep audit, 320-393 px viewports)
- **Command palette was never mounted** — the module existed but nothing instantiated
  it: the home hero search button emitted an event nobody listened to, Ctrl/Cmd+K was
  dead, and the header search pill silently fell back to plain navigation. The palette
  is now created in `bootstrap.js`, mounted in the shell, and wired to the header
  trigger, the hero button, `/` and Ctrl/Cmd+K.
- **Safe-area insets silently no-op'd** — `index.html` lacked `viewport-fit=cover`, so
  every `env(safe-area-inset-*)` rule returned 0 on notched phones. Fixed in
  `index.html` and `404.html`; the bottom nav now extends over the home indicator
  (its old fixed 64px height *including* the inset crushed the tabs to ~30px), and the
  header, modal overlay and palette respect left/right notch insets in landscape.
- **Wide lesson diagrams were unreadable** — a 1886-unit tree diagram shrank to 249px
  on a 320px phone, rendering 14px labels at ~1.8px. New `utils/lesson-media.js`
  re-wraps wide `svg.zl-diagram` elements in a horizontally pannable `.ou-media-scroll`
  at a legible scale (labels now ~9px), with edge-fade affordance; narrow diagrams
  keep shrink-to-fit.
- **Tables crushed to one word per line** — lesson tables had no column floor, so a
  3-column table compressed cells to ~65px on phones. Columns now keep an 8.5em
  minimum under 640px and the existing wrapper scrolls the table instead.
- **Vendor icon glyphs showed as literal words** — the Zolto renderer emits
  Material-Symbols *ligature* spans, but that font was never loaded, so lessons with
  `@alert`-style icons displayed the word "warning" instead of a glyph. They are now
  rewritten to real FA solid icons at render time.
- **iOS auto-zoom on focus** — the search box (15px) and command-palette (15.8px)
  inputs sat below Safari's 16px zoom threshold and zoomed the page on every focus;
  both now guarantee 16px+.
- **Touch targets below 44px** — header search pill (36px), search filter pills
  (31px), lesson back-link (21px), "See all" links (25px), small buttons on coarse
  pointers, MCQ options (now min 48px), palette rows and esc button all meet the
  44px+ bar without changing desktop layout.
- **Mobile text floor** — fluid root font floor raised 15px → 16px, so `0.75rem`
  labels (bottom-nav tabs, badges, form hints) render at 12px instead of ~11.3px.
- **Modal on small screens** — max-height now uses `min(90vh, 100dvh - gap)` so tall
  modals can't hide their footer behind mobile browser chrome; scroll chaining is
  contained; footer buttons wrap full-width under 400px; palette anchors below the
  keyboard on phones.
- Anchor jumps respect the sticky header via `scroll-padding-top`; horizontal scroll
  containers (tables, pills, diagrams) get momentum scrolling and `overscroll-behavior`
  containment.

### Added — 67 new lessons and 5 new sub-subjects (369 total, 3,773 MCQs)
- Computer Science grows from 20 to 35 lessons and gains three new sub-subjects:
  **Databases** (DBMS concepts, SQL, ER model and normalisation, transactions),
  **Cybersecurity** (CIA triad, cryptography, network defence, digital safety) and
  **Web Development** (how the web works, HTML, CSS, JavaScript and the DOM).
- Reasoning grows from 109 to 116 lessons and gains two new sub-subjects:
  **Verbal Reasoning** (statements, assumptions, conclusions, cause and effect)
  and **Data Sufficiency** (arithmetic and reasoning variants with the standard
  I-alone / II-alone / either / both option sets).
- Mathematics grows from 19 to 30: exponents and sets (Numbers), sequences,
  permutations and combinations, binomial theorem, matrices (Algebra),
  coordinate geometry, trigonometry and mensuration (Geometry), sampling
  (Statistics) and applications of calculus.
- Economics grows from 13 to 18 (consumer behaviour, sectors of the Indian
  economy, planning, the 1991 LPG reforms, human and sustainable development).
- Geography grows from 13 to 18 (agriculture, mineral and energy resources,
  industries, transport and trade, disasters and disaster management).
- History grows from 14 to 19 (post-Mauryan kingdoms, south Indian kingdoms,
  Vijayanagara and Bahmani, Bhakti and Sufi movements, 19th-century reforms).
- Civics grows from 18 to 22 with four Hindi-language lessons: constitutional
  amendments, emergency provisions, centre-state relations and political
  parties with the anti-defection law.
- Science grows from 34 to 39: fluids and modern physics (Physics),
  environmental chemistry (Chemistry), genetics-evolution and biotechnology
  (Biology, in Hindi).
- Languages grows from 51 to 58: phrasal verbs, writing skills, error-spotting
  and cloze tests (English); prefixes-suffixes, paragraph and essay writing,
  letter writing and comprehension (Hindi).
- Philosophy grows from 11 to 14: political philosophy,
  philosophy of mind and applied ethics join the existing set.
- Every new lesson ships with a 10-question MCQ bank (670 new questions) in the
  same lesson language, plus tables, diagrams, charts and worked examples.
- `subject-registry.json` and `search-index.json` regenerated; all 369 lesson
  files and 369 MCQ banks validated; command palette and search cover everything.

### Added — "Ink & Accent" branding & media kit
- Brand system: black & white stay the identity; color returns as **optional,
  small-dose accents** — one soft pastel per subject (icon badges + subject-page
  chips), a gentle highlight for marks, functional green/red on quizzes. All hues
  live in `src/styles/components/accents.css`; the high-contrast theme strips them.
- Brand kit in `assets/branding/`: logo mark + horizontal lockups (light/dark SVG),
  Libby the owl mascot (AI-illustrated, background removed), README hero banner,
  GitHub social preview (also at `.github/social-preview.png`), and three
  advertising posters (portrait 1080×1350, square 1080×1080, story 1080×1920).
- Regenerated all app icons from the new mark (favicon, PWA, maskable) — the
  navbar logo rebrands automatically.
- `BRANDING.md`: palette tables, logo usage rules, voice & tone, media kit index.
- README rewritten around the brand: banner, badges, screenshots, subject table,
  quick start; `tree.md` regenerated; empty-state icon centering fixed.

### Added — 93 new lessons across every thin subject (302 total, 3,104 MCQs)
- Economics 1 → 13: demand/supply, elasticity, production & costs, market
  structures, national income, money, banking & RBI, inflation, monetary
  policy, fiscal policy & budget, poverty & employment, international
  trade & BOP.
- Geography 1 → 13: Earth's interior, rocks & minerals, landforms,
  earthquakes & volcanoes, atmosphere & insolation, pressure & winds,
  Indian monsoon, oceans, currents & tides, Indian rivers & lakes, soils
  & vegetation, world population.
- History 1 → 14: Indus Valley, Vedic age, Buddhism & Jainism, Mauryas,
  Guptas & classical India, Delhi Sultanate, Mughals, Marathas &
  18th century, British conquest & 1857, national movement 1885-1919,
  Gandhian era, world revolutions, world wars & Cold War.
- Philosophy 1 → 11: logic & fallacies, Charvaka & heterodox schools,
  Buddhist philosophy, Jain philosophy, six orthodox schools, Upanishads
  & Vedanta, Greek philosophy, medieval-to-early-modern, Kant to
  existentialism, ethics theories.
- Chemistry 1 → 11: atomic structure, periodic table, bonding, acids/
  bases/salts, reactions & equilibrium, metals & non-metals, carbon
  compounds, mole concept, electrochemistry, nuclear & everyday
  chemistry.
- Physics 2 → 10: units & measurement, laws of motion, work-energy-power,
  gravitation, heat & thermodynamics, waves & sound, light & optics,
  electricity & magnetism.
- Computer Science 7 → 20: sorting algorithms, recursion & divide-and-
  conquer, graph algorithms, DP & greedy (algorithms 1→5); OSI & TCP/IP
  models, IP addressing & routing, protocols & security (networking 1→4);
  processes & scheduling, memory management, file systems & deadlocks
  (OS 1→4); data structures, OOP, debugging & dev tools (programming
  1→4).
- Reasoning 102 → 109: number series patterns, alphabet & mixed series
  (series 1→3); syllogism possibility & Venn methods, reverse
  syllogism (syllogism 1→3); linear & circular seating arrangement
  (seating 1→3); para-jumble strategies (rearrangement 1→2).
- Mathematics 11 → 19: fractions & decimals, LCM & HCF (numbers 2→4);
  polynomials & factorisation (algebra 3→4); triangles, circles
  (geometry 2→4); probability, data interpretation & correlation
  (statistics 2→4); integration basics (calculus 2→3).
- Every new lesson ships a matching MCQ file (8-10 questions, rationales
  citing the lesson), is registered in its topic's `index.json` +
  `details.zl` `@lessons` block, and flows into the regenerated
  subject registry and search index.

### Fixed — content bugs
- Removed 204 duplicated files from reasoning: the subject's
  restructure into 11 topic folders had left all 102 root-level
  lessons (and their 102 MCQs) behind as byte-identical copies. Every
  reasoning lesson was reachable at two routes, duplicated in search
  results, and double-counted by the registry (which reported 211
  lessons for 109 real ones). Canonical copies live in the topic
  folders; the subject page now shows topics only.
- `physics/mcq/lesson1mcq.json` carried `"lessonId":
  "physics-motion-001"` — inconsistent with its `lesson1` slug (MCQs
  load by filename, so it worked, but the field lied).
- `chemistry/lessons/acids-bases-and-salts.zl` used `\log_{10}` and
  `^{+}` inside an `@math` block — two LaTeX forms the vendored Zolto
  engine's math parser rejects (three M006 errors failing
  `validate:zolto`). Rewritten as the equivalent `pH = -\log[H^+]`.



### Changed — "Ink & Paper" monochrome palette (colors only)
- Full color swap to black & white, so nothing competes with the content
  while studying. No layout, animation, or behavior changes — every rule
  touched is a color value.
- **Identity colors** — Apple blue `#0071e3` (light) / `#2997ff` (dark)
  replaced by ink `#1d1d1f` (light) and paper-white `#f5f5f7` (dark).
  `--ou-accent-contrast` now flips per theme (white-on-ink / black-on-
  paper) so accent-filled surfaces stay readable in both. Focus rings
  follow the accent. Backgrounds are pure `#ffffff` (light) / `#000000`
  (dark); `--ou-gradient-brand` / `--ou-gradient-success` are grayscale
  ink gradients now.
- **Functional colors only** — success/warning/danger survive solely for
  quiz right/wrong, admonitions, toasts and destructive actions, muted to
  `#1e8e3e`/`#a05000`/`#c5221f` (light) with lighter dark-theme variants
  (`#6fd08c`/`#e8a04c`/`#ef6b62`) that hold contrast on black. The
  opt-in high-contrast theme keeps its AAA yellow accent.
- **Per-subject card colors removed** — every subject icon badge is now
  the same ink-on-paper mark (`currentColor`, theme-adaptive) instead of
  a per-subject hue; the rotating fallback palette is gone too.
- **Progress bars** — flat ink fill (no blue gradient); the
  indeterminate shimmer mixes the accent with transparency instead of a
  second hue. Button/icon glows are neutral black shadows.
- **Assets** — all app icons (32/180/192/512/maskable) recolored from
  blue to ink (transparent-glyph variants) and black-tile/white-glyph
  (maskable); the dark theme inverts the header logo via CSS `filter`.
  `manifest.json`, `theme-color` meta and the JS-failed fallback button
  match the new palette.
- Regenerated `src/styles/main.bundle.css` (`npm run build:css`).

### Added — performance, offline & reading-experience pass
- **Command palette (Ctrl/Cmd+K, also `/`)** — one-shortcut jump to any
  lesson (ranked by the same engine the Search page uses), subject, or app
  action (toggle theme, random lesson, destinations). VS Code/Raycast
  keyboard contract (↑↓ navigate, ↵ open, esc close), full
  dialog/listbox ARIA, focus restore on close. The header gains a search
  trigger showing the shortcut; the home hero has an input-shaped button
  that opens it via a new `palette:open` bus event (pages stay decoupled
  from the shell).
- **Offline support (real PWA now, not just a manifest)** — root-level
  `sw.js`: precached app shell, stale-while-revalidate for same-origin
  assets, network-first navigations falling back to the cached shell.
  Verified by reloading a lesson with the network cut — it renders.
  Root placement matters: a `public/sw.js` would default to a `/public/`
  scope and control nothing (GitHub Pages can't send
  `Service-Worker-Allowed`). Registered after first render so it never
  competes with startup; skipped on file://.
- **Inline SVG icon system** replacing the Font Awesome 6.5.2 CDN — the
  app's last runtime network dependency (~100 KB CSS + webfonts for ~35
  glyphs) is gone. `utils/icon.js` keeps its exact call signature and
  accessibility contract; `utils/icons.js` holds the 24×24 stroke set
  under FA-compatible names. No more icon flash on slow links; works
  from file://. The one CSS-referenced FA glyph (accordion chevron) is a
  pure-CSS rotated border now.
- **Single bundled stylesheet** (`npm run build:css` →
  `tools/bundle-css.js`) — main.css's 28-file `@import` chain became one
  request instead of a waterfall. Source files stay split and readable;
  cascade order is preserved exactly (media-qualified imports become
  `@media` blocks). index.html ships the bundle; main.css still works
  standalone for development.
- **Lesson reading experience**: scroll-progress bar under the header
  (compositor-only `scaleX`, rAF-throttled, self-cleaning listener), a
  script-aware reading-time estimate in the lesson meta (~200 wpm, with
  CJK/Devanagari adjustments), ← / → keyboard prev/next (ignored while
  typing, self-removing on route change), and a global back-to-top
  button that appears after 600 px.
- **"Continue where you left off"** — the last opened lesson is recorded
  locally and offered as a one-click resume card on the home page.
- **Home hero**: gradient accent on the headline, an opening search
  field, and a provenance stats line (N subjects · N lessons · always
  free). Subject-card descriptions clamp to three lines so one long
  entry (Reasoning) no longer stretches its whole grid row.
- **404 with a way forward**: subject chips + a search button, not just
  "Back to home".
- Manifest `shortcuts` (long-press: Subjects / Search / Progress) and
  `categories`.

### Fixed — this pass
- **Route-outlet focus ring drew two full-height blue lines** around the
  entire content column on every navigation: `main#route-outlet` is
  programmatically focused after each route change, and the global
  `:focus-visible` ring (3px accent outline) applied to that
  non-interactive container. The outline is suppressed for the outlet
  only; real elements keep their rings.
- **Scroll position leaked across routes**: navigating from the bottom
  of a long page to a new route rendered the new page mid-scroll. New
  navigations now scroll to top; back/forward restore the previous
  offset per path (popstate-before-hashchange distinguishes traversal
  from fresh navigation).
- **Dark theme ignored the OS**: `defaultTheme` was hardcoded to light,
  so system-dark users got white on every cold load. With no stored
  preference the app now follows `prefers-color-scheme` — including
  live OS switches — until the user picks a theme manually.
- **Quick-action cards rendered icon jammed against the label**: cards.css
  (imported after layout.css) re-won `display: block` at equal
  specificity, silently flattening the flex-column layout. The selector
  is doubled so intent wins regardless of file order.
- **`probabilitymcq.json` failed to parse** (`"id": 8",` — stray quote),
  which made the statistics quiz 404 and failed
  `tests/content/mcq-validation.test.js` (37/37 tests pass now).

### Added — placeholder lessons written for real
- The 15 remaining `lesson1.zl` scaffolds ("TODO: write lesson content.")
  across economics, geography, history, languages, philosophy,
  computer-science (algorithms / networking / operating-systems /
  programming), mathematics (algebra / calculus / geometry / statistics),
  biology, and chemistry now contain real lessons in the Zolto format —
  headings, tables, admonitions, diagrams, and math where appropriate.
- Each of those lessons got a matching `*mcq.json` question bank (4–5
  questions with rationales; the previous files were empty shells), so
  every one now shows a working "Take the quiz" card.
- `science/biology/index.json` lists its `lesson1` again — it existed on
  disk but was unlisted, which is what the index/lessons consistency test
  caught.
- Real GitHub issue forms (bug / feature / lesson contribution) replace
  the three `# TODO: define workflow/template` stubs, plus a real pull
  request template and a fonts README that documents the system-font
  decision instead of a bare "TODO."

### Fixed — real bugs found by review + headless-browser testing
- Quiz review tracked the wrong answers. The selected option was never
  passed to the quiz container; a `findIndex` fallback meant every wrong
  answer was recorded as "picked option A", so the post-quiz review could
  claim you chose something you never clicked. The chosen index now flows
  through, and browser testing confirms the score/review match actual
  picks.
- High contrast mode could never be turned back off: enabling it
  overwrote `data-theme`, disabling left every page stuck in high
  contrast until a theme button was pressed manually — and on boot it ran
  *before* the stored theme was applied, silently cancelling itself.
  High contrast is now layered on top of the chosen light/dark theme and
  restores it when disabled (round-trip verified in-browser).
- Rapid navigation race: clicking link A then quickly link B let the
  slower route finish loading after the faster one and overwrite it —
  the page showed content for a URL already left behind. Routes now carry
  a navigation token; stale renders are discarded before they can mount
  (regression-tested in-browser).
- Note editors leaked a window-level `beforeunload` listener per visit:
  after typing in notes on N lesson visits, all N guards stayed armed for
  the session's lifetime (memory leak + permanent "leave site?" prompts).
  They now detach when the editor unmounts on navigation.
- Bookmark links for flat subjects (economics, history…) pointed at
  `#/subjects/<id>/undefined/lessons/<id>` because the href interpolated
  an absent sub-subject segment — every bookmark of those subjects 404'd.
- Search ranking discarded base relevance: results were re-sorted by the
  "studied before" boost alone, letting a barely-matching studied lesson
  outrank a strong unstudied match. Relevance is now the primary key with
  the history boost as a bounded promotion, matching the README's
  "user history as *a* factor".
- Pressing Enter in the search box fired the search immediately AND let
  the still-pending debounce fire the same query again ~250 ms later
  (duplicate work, duplicated history entry). The pending call is now
  cancelled.
- A failed search-index load cached the empty failure forever for the
  session; the promise now resets so the next query retries.
- `build-search-index.js` indexed translation variants (`lesson1.hi.zl`)
  as separate entries at the same URL as their English originals —
  duplicate search results pointing at one destination. Variants are
  skipped; translations remain reachable via the language switcher.
- Content validation false-positive: pseudocode like `A[mid]` inside a
  fenced code block counted as admonition tags (`[mid]`) and tripped
  "unbalanced blocks" on legitimate lessons. Both the tool and the
  mirrored test strip fences before scanning.

### Changed — performance ("feels laggy" pass)
- Listing pages no longer fetch every lesson's full source just to regex
  out a title. Subject / sub-subject / related-lesson listings now use
  the generated search index (one cached JSON fetch) via the new
  `lesson-title-service`. The reasoning → coding-decoding page went from
  22 `.zl` requests to 0 extra requests.
- The loader coalesces concurrent identical fetches into one request and
  negative-caches 404s for 30 s — switching a lesson to Spanish used to
  re-request the missing `.es.zl` on every visit; misses are now instant
  fallbacks.
- Primary-nav page modules (home/subjects/search/progress) prefetch
  during idle time after first paint, removing the first-tap delay caused
  by dynamic imports; `<link rel="modulepreload">` covers bootstrap.
- Search scoring precomputes lowercase title/subject/content fields once
  per index load instead of lowercasing every entry's full content for
  every token of every query.
- `empty()` clears containers in one browser-side pass instead of a
  removeChild loop.

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
