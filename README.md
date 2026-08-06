# OpenKnowledge

*(Renamed from OpenUniversity. The GitHub repo is still at
[github.com/uxle/OpenUniversity](https://github.com/uxle/OpenUniversity) —
rename it there too if you want the URL to match. "University" implied
enrollment and courses; this project is really about open access to
knowledge itself.)*

> **Knowledge is everyone's right.**

**OpenKnowledge** is an open-source, text-first knowledge base designed to make learning **clear, interactive, visual, accessible, and easy to contribute to** — aiming for a calmer, more focused reading experience than a typical wiki, with real interactivity (quizzes, translations, progress tracking) built in rather than bolted on.

No video courses are required.

Instead, OpenKnowledge focuses on:

- High-quality text lessons
- Rich UI/UX and visual explanations
- Interactive learning
- Built-in MCQ engine
- Per-lesson translation
- PDF export
- Learning progress tracking
- Bookmarks
- Personal notes
- Fast content search
- Open knowledge contributions
- Accessibility
- Light, dark, and high-contrast themes

> **Turn written knowledge into an interactive learning experience.**

## Status

The app now runs as a real single-page app — wired together, tested end
to end in an actual headless browser (Playwright + Chromium), and fixed
based on what that testing found. Not a claim: 19/19 checks pass with
zero console/page errors as of this writing (browser test log available
on request — it isn't checked into the repo).

The UI was reworked to match a supplied reference design: no persistent
sidebar, a minimal sticky header, and a floating bottom nav visible at
every screen width — see CHANGELOG for the specific real bugs (touch
targets, a menu that didn't close on navigation, a footer/nav overlap)
that testing this found and fixed.

**If a page shows "This page couldn't load":** that's the app working as
intended — one broken/missing file now fails only that route instead of
the whole app (see Fixed, below). It almost always means the folder on
disk is out of sync with what's actually in this zip. Delete the old
folder entirely and re-extract fresh rather than extracting on top of it
— a partial/interrupted download can silently drop a file, which
`unzip`/file managers don't always warn about loudly.

**What's real and browser-verified:**
- **Full app shell** — `index.html` boots `src/app/bootstrap.js`, which
  builds a persistent header/sidebar/footer/mobile-nav around a route
  outlet. Navigating Home → Subjects → Science → Physics → lesson →
  quiz all actually works.
- **Translation** — per-lesson language switcher. `lesson1.hi.zl` is a
  real, complete Hindi translation (verified rendering correctly);
  switching to a language with no translation yet (e.g. Spanish) falls
  back to English with a visible notice instead of erroring.
- **Dark/light mode** — icon toggle in the header, `<meta name=theme-color>`
  updates with it. High-contrast lives in Settings.
- **Export as PDF** — `window.print()` + a dedicated print stylesheet;
  verified in print-media emulation that it actually hides chrome
  (header/sidebar/nav/buttons) and keeps the lesson content.
- **Next/related lessons, progress, bookmarks, notes** — all wired and
  exercised in the browser test, not just written.
- **Font Awesome (solid, free)** icons throughout the real app — via CDN
  + an `aria-hidden`/`aria-label`-aware `utils/icon.js` helper.
  `src/engines/mcq-engine.js` deliberately keeps its plain ✓/✕ glyphs
  instead, since that file is meant to work with zero dependencies.
- Ran a chunk of a UI/UX checklist (`AGENTS.txt`, supplied in chat) against
  the app: per-route `document.title` (was static before — real bug),
  progress bars animate via `transform` not `width` (compositor-friendly),
  native `<select>` gets explicit colors (Windows dark-mode fix), mobile
  inputs force ≥16px to stop iOS zoom, 44px touch targets, safe-area
  insets on the mobile nav, real `<form>`/`type="submit"` semantics so
  Enter submits (was broken — buttons were all `type="button"`), destructive
  note deletion goes through a confirm dialog, `autocomplete`/`inputmode`
  on account fields, layered shadows, `text-wrap: balance` headings.

**Real bugs this testing pass found and fixed** (each reproduced, then
fixed, then re-verified in the browser):
1. `zolto-engine.js` imported the bare specifier `"zolto"`, which an
   import map pointed at `https://esm.sh/zolto@1.0.0`. That URL 404s —
   **the `zolto` package was never actually published to the npm
   registry** (only the source exists, at github.com/uxle/Zolto), so
   neither `npm install` nor the CDN fallback could ever have worked.
   This surfaced in the browser as "Failed to fetch dynamically imported
   module: .../src/pages/lesson.js" on every lesson page. Fixed for real
   by replacing the dependency with `src/engines/zolto/mini-zolto.js` —
   a genuine, local, zero-dependency implementation of the Phase 1/2/4
   subset (Markdown core, admonitions, math) that this repo's lessons
   actually use. `zolto-engine.js` keeps the exact same exported function
   names, so nothing downstream had to change. See that file's header
   comment for the full story, and `tests/engines/zolto-engine.test.js`
   for real (no longer skipped) compile assertions.
2. `engines/progress-engine.js` didn't actually export `getLessonProgress`,
   even though `pages/lesson.js` imported it — a `SyntaxError` at module-load
   time that also crashed the whole app. (Wrote a static import/export
   checker afterward — no other instances found.)
3. The MCQ answer handler called `classList.add("")` for unselected,
   non-correct options — `DOMTokenList` throws on an empty string, which
   silently broke scoring an incorrect answer.
4. Bootstrap's sidebar wrapper and the `<aside>` inside it both carried
   the same CSS grid-area class — harmless visually but structurally
   wrong; caught via a strict-mode Playwright selector collision.

**What's still genuinely unverified:** the Font Awesome CDN link
(`cdnjs.cloudflare.com`) — icons render correctly assuming that request
succeeds, but it hasn't been exercised against a real network from this
environment. (The `zolto` CDN dependency this section used to flag as
unverified has since been removed entirely — see bug #1 above — so lesson
rendering no longer depends on any network request at all.)

**Not done:**
- Two subjects/lessons have real content now (Physics, with a full Hindi
  translation, and the Hindi-language sub-subject's `varnmala` lesson);
  the remaining lesson/MCQ pairs are still placeholder `.zl`/`.json` files.
- Zolto's native `@quiz`/`@mcq` syntax still overlaps, undecided, with the
  standalone MCQ engine — see the note in `zolto-engine.js`. (`mini-zolto.js`
  doesn't implement that syntax at all yet — see its own header.)
- `logo.svg` is still the original placeholder — intentionally left alone,
  ready to be swapped.
- Most subjects' `details.zl` files are still the placeholder `# Details`
  stub, so their card titles on the Subjects page show "Details" instead
  of their real name — Languages and Science have been given real titles;
  the rest (Computer Science, Economics, Geography, History, Mathematics,
  Philosophy) haven't.

## Features

### Text-First Courses

Courses are stored as human-readable Zolto (`.zl`) files instead of being locked inside a database or video platform.

```text
src/
└── subjects/
    └── science/
        └── physics/
            └── lessons/
                └── lesson1.zl
```

This makes educational content portable, version-controlled, easy to edit, easy to review, easy to translate, and easy to contribute to.

### Interactive Lessons

A lesson can contain:

- Headings
- Explanations
- Examples
- Key points
- Definitions
- Formulas
- Tables
- Lists
- Interactive elements
- Diagrams
- Knowledge checks
- Related lessons
- Glossary terms

The lesson engine parses Zolto (`.zl`) into the final learning interface.

### MCQ Engine

Every lesson can optionally have its own question bank.

```text
physics/
├── lessons/
│   └── lesson1.zl
└── mcq/
    └── lesson1mcq.json
```

The MCQ engine can provide:

- Multiple-choice questions
- Instant feedback
- Explanations
- Score calculation
- Question progress
- Review mode
- Retry
- Performance tracking

### Search

OpenKnowledge includes a dedicated search system for discovering knowledge.

Search can eventually support:

- Subjects
- Sub-subjects
- Lessons
- Keywords
- Definitions
- Questions
- Tags
- Glossary terms

### Bookmarks

Users can bookmark important lessons and sections.

Bookmarks can eventually support folders and custom organization.

### Personal Notes

Users can create private notes while learning. Notes are associated with the user's learning environment rather than the public educational content.

### Progress Tracking

OpenKnowledge can track:

- Lessons completed
- Subject progress
- MCQ scores
- Quiz attempts
- Learning streaks
- Recently studied lessons
- Bookmarked lessons
- Achievements

## Project Structure

The complete production project tree is maintained separately so this README stays focused on architecture and contributor documentation.

**Complete folder/file structure:** [tree.md](tree.md)

The tree includes the application engines, Zolto parser/renderer, content hierarchy, components, services, storage, styles, schemas, tools, tests, assets, and GitHub automation.

## Content Architecture

Educational content follows a simple hierarchy:

```text
Subject
   │
   └── Sub-subject
          │
          ├── Lesson
          ├── Lesson
          └── Lesson
```

Example:

```text
Science
└── Physics
    ├── Introduction to Physics
    ├── Motion
    ├── Force
    ├── Energy
    └── Newton's Laws
```

# Subject and Sub-Subject Details

Educational metadata and lessons are stored in **Zolto** (`.zl`) files and structured JSON formats to maintain clear organization, human readability, and machine accessibility.

---

## 1. Subject Metadata

Subject-level metadata defines top-level educational domains (e.g., Science, Mathematics, History).

**File Location:**  
`src/subjects/science/details.zl`

**Example (`.zl`):**

```zl
# Science

@subject {
  id: science
  title: "Science"
  description: "Explore the natural world through scientific knowledge."
}

@subSubjects {
  physics
  chemistry
  biology
}
```

---

## 2. Sub-Subject Metadata

Sub-subjects define specific branches within a primary subject (e.g., Physics under Science).

**File Location:**  
`src/subjects/science/physics/details.zl`

**Example (`.zl`):**

```zl
# Physics

@subject {
  id: physics
  title: "Physics"
  parent: science
  description: "Study matter, energy, motion, forces and the laws of nature."
}

@lessons {
  lesson1
  lesson2
}
```

---

## 3. Lesson Content

Lessons use Zolto (`.zl`) syntax, enabling contributors to write rich, readable educational content without dealing with deeply nested JSON formats.

**File Location:**  
`src/subjects/science/physics/lessons/lesson1.zl`

A lesson file can combine standard Markdown text with structured educational blocks such as equations, diagrams, examples, definitions, callouts, timelines, concept maps, and interactive components.

**Example (`.zl`):**

### [zolto](https://github.com/uxle/Zolto)

```zl
# Introduction to Motion

Motion is the change in position of an object over time.

[definition]
Motion describes how an object's position changes relative to a
reference point.
[/definition]

@math label="eq:velocity"
v = \frac{d}{t}
@/math

[important]
Motion always depends on a reference frame.
[/important]

## Example

A car travels 100 km in 2 hours.

@math label="eq:velocity-example"
v = \frac{100}{2}
@/math

**Answer:** 50 km/h
```

This uses Zolto's real, documented syntax: `[definition]`/`[important]` are
two of its 24 built-in Phase 2 admonition types, and `@math ... @/math` is
its Phase 4 block-math directive — verified against Zolto's own
`SPECIFICATION.md` rather than guessed at. (An earlier draft of this README
used `@definition { }` / `@equation { }`, which aren't real Zolto
directives — fixed here.)

> **Note:** The Zolto engine parses `.zl` source files and renders them as accessible HTML and UI components. OpenKnowledge consumes it via `src/engines/zolto/zolto-engine.js`, which wraps the real `zolto` npm package rather than reimplementing a parser.

---

## 4. Multiple Choice Questions (MCQs)

MCQs are written in JSON because they represent structured, machine-readable question data meant for evaluation engines.

**File Location:**  
`src/subjects/science/physics/mcq/lesson1mcq.json`

**Example (`.json`):**

```json
{
  "lessonId": "physics-motion-001",
  "title": "Introduction to Motion",
  "questions": [
    {
      "id": 1,
      "question": "What is motion?",
      "options": [
        "Change in position over time",
        "Change in color",
        "Increase in mass",
        "Remaining stationary"
      ],
      "correct": 0,
      "rationale": "Motion is a change in the position of an object with respect to time."
    }
  ]
}
```

---

## 5. Content Validation

To maintain repository consistency and render accuracy across the platform, all Zolto (`.zl`) and JSON files must adhere to strict validation rules before build or deployment.

### A. Zolto (`.zl`) Validation Guidelines
1. **Syntax & Structure:**
   - Every file must start with a primary header (`# Document Title`).
   - All block annotations (e.g., `@subject`, `@definition`, `@equation`, `@example`) must be correctly opened `{` and closed `}`.
2. **Metadata Consistency:**
   - Subject and Sub-subject IDs must be lowercase, alphanumeric, and unique across the repository.
   - Reference blocks (`@subSubjects`, `@lessons`) must point to existing directories or files relative to their sub-paths.
3. **Math & LaTeX Formatting:**
   - Inline and block LaTeX expressions inside `@equation` tags must use valid LaTeX syntax (e.g., `\frac{a}{b}`).

### B. MCQ (`.json`) Validation Guidelines
1. **Schema Standards:**
   - `questions` is required and must be a non-empty array of question objects.
   - `lessonId` is recommended (not strictly required by the engine) so tooling can cross-reference a question bank back to its lesson.
2. **Question Integrity:**
   - Each question object must contain `id`, `question`, `options`, `correct`, and `rationale`.
   - `options` must be an array of at least 2 distinct choices.
   - `correct` must be a valid zero-indexed integer corresponding to the correct entry in `options`.
3. **ID Uniqueness:**
   - Question IDs (`1`, `2`, ...) must be unique within the individual JSON file and dataset.

See `schemas/mcq.schema.json` for the machine-checkable version of these rules, and `src/engines/mcq-engine.js` for the reference implementation that consumes this shape.


OpenKnowledge uses schemas and Zolto validation to make sure contributors don't accidentally break the learning system.

```text
schemas/
├── subject.schema.json
├── sub-subject.schema.json
├── lesson.schema.json
├── mcq.schema.json
├── user.schema.json
└── contribution.schema.json
```

Automated validation can check:

- Required fields
- Valid JSON and valid Zolto syntax
- Duplicate IDs
- Broken references
- Invalid MCQ answers
- Missing lessons
- Invalid subject structure
- Invalid Zolto blocks and references

## Open Contributions

OpenKnowledge is designed around the idea that **knowledge should be easy to contribute to**.

Anyone can potentially contribute:

- New subjects
- New sub-subjects
- Lessons
- MCQs
- Corrections
- Translations
- Explanations
- Examples
- Diagrams
- Accessibility improvements
- UI improvements
- New learning tools

A contributor should not need to modify the core engine to add educational content.

```text
Add a lesson
     ↓
Create `.zl` / JSON content
     ↓
Validate JSON
     ↓
Submit contribution
     ↓
Review
     ↓
Merge
     ↓
OpenKnowledge publishes it
```

## Technology

OpenKnowledge is designed to remain lightweight.

### Core

```text
HTML
CSS
JavaScript
Zolto (.zl)
JSON
```

### Browser Storage

```text
IndexedDB
localStorage
```

### Optional Future Backend

```text
REST API / GraphQL
Authentication
Database
Cloud synchronization
```

The first version can work without requiring a backend.

## Offline-Friendly Design

OpenKnowledge should eventually support learning even when the user has limited or no internet access.

```text
Browser
   │
   ├── HTML
   ├── CSS
   ├── JavaScript
   ├── Zolto lessons and JSON data
   │
   └── IndexedDB
        ├── Progress
        ├── Notes
        ├── Bookmarks
        └── MCQ results
```

A Progressive Web App architecture can later provide:

- Offline lessons
- Cached subjects
- Offline MCQs
- Installable application
- Background synchronization

## UI/UX Philosophy

OpenKnowledge is **text-first but not visually boring**.

The interface should use visual design to make complex information easier to understand.

Possible UI elements:

- Interactive cards
- Progress indicators
- Timelines
- Diagrams
- Concept maps
- Formula blocks
- Comparison tables
- Highlighted definitions
- Expandable explanations
- Step-by-step examples
- Interactive MCQs
- Visual feedback
- Smooth transitions
- Responsive layouts

> **Maximum clarity, not maximum decoration.**

## Accessibility

Accessibility should be considered from the beginning.

OpenKnowledge should support:

- Keyboard navigation
- Screen readers
- Semantic HTML
- Focus management
- High contrast
- Adjustable text size
- Reduced motion
- Accessible MCQs
- Accessible diagrams
- Clear color contrast

## Internationalization

The platform should eventually support multiple languages.

```text
src/i18n/
├── i18n.js
├── en.json
└── hi.json
```

Educational content can eventually have language variants:

```text
lesson1.en.zl
lesson1.hi.zl
lesson1.es.zl
```

## User Data

Public educational content and private user data should remain separate.

### Public

```text
Subjects
Lessons
MCQs
Definitions
Diagrams
```

### Private

```text
Progress
Bookmarks
Notes
Preferences
Quiz history
Account information
```

For a frontend-only version, IndexedDB can store personal learning data locally.

A future server-based version can synchronize this data across devices.

## Search Architecture

Search can eventually use a generated index:

```text
src/data/search-index.json
```

```text
Search
  ↓
Search Engine
  ↓
Search Index
  ↓
Ranking
  ↓
Filters
  ↓
Results
```

Potential ranking factors:

1. Exact title match
2. Keyword match
3. Subject match
4. Lesson relevance
5. Content relevance
6. Popularity
7. User history

## Learning Analytics

The platform can locally calculate useful learning statistics:

```text
Learning Statistics
│
├── Lessons completed
├── MCQs answered
├── Accuracy
├── Study streak
├── Subject progress
├── Weak topics
└── Strong topics
```

The purpose should be to **help learners**, not to manipulate them.

## Testing

OpenKnowledge should test both software and educational content.

```text
tests/
├── engines/
├── components/
├── content/
└── integration/
```

Examples include:

```text
MCQ Engine
    ↓
Question loading
    ↓
Answer validation
    ↓
Score calculation
    ↓
Result generation
```

## Development Tools

The `tools/` directory contains scripts that help maintain the knowledge base.

```text
tools/
├── validate-content.js
├── build-search-index.js
├── generate-registry.js
├── check-links.js
└── check-duplicates.js
```

These tools can automatically:

- Validate lessons
- Validate MCQs
- Generate search indexes
- Find duplicate IDs
- Find broken references
- Generate subject registries

## Roadmap

### Phase 1 — Foundation

- [x] Basic HTML application
- [x] Subject system (engine + services real; only one subject has real content)
- [x] Sub-subject system (same as above)
- [x] Zolto lesson system (adapter written; needs `npm install` + first real run — see Status above)
- [x] Basic lesson renderer (`pages/lesson.js` composes it; untested end-to-end — same npm-install gap)

### Phase 2 — Learning

- [x] MCQ engine (standalone `mcq-engine.js`, plus a componentized version in `components/mcq/`)
- [x] Scoring
- [x] Lesson completion (`engines/progress-engine.js` + IndexedDB storage)
- [x] Progress tracking (`pages/progress.js`, streaks, accuracy, subject breakdown)

### Phase 3 — Personalization

- [x] Bookmarks (IndexedDB-backed, folder grouping)
- [x] Notes (IndexedDB-backed, sanitized input)
- [x] History (search history; lesson "last studied" via progress records)
- [x] Learning dashboard (`pages/progress.js`)

### Phase 4 — Discovery

- [x] Search (`services/search-service.js` — title/keyword/subject scoring against `search-index.json`)
- [x] Filters (by subject, in `pages/search.js`)
- [x] Suggestions (prefix-matched from search history — not yet a full typeahead index)
- [x] Related lessons (same-sub-subject heuristic in `recommendation-engine.js`)

### Phase 5 — UX

- [ ] Advanced animations
- [x] Responsive design (`responsive.css`, mobile nav, app-shell grid)
- [x] Dark mode (`themes/dark.css`, `themes/high-contrast.css`)
- [x] Accessibility (focus trap/manager, screen-reader announcer, reduced-motion/high-contrast/text-size settings)
- [x] Improved navigation (router, breadcrumbs, prev/next lesson)

### Phase 6 — Community

- [x] Contribution workflow (local-validate step only — `pages/contribute.js`; submit/review/merge still manual, see `services/contribution-service.js`)
- [x] Content validation (`tools/validate-content.js`, `check-links.js`, `check-duplicates.js` — all run clean)
- [ ] Contributor profiles
- [ ] Reviews
- [ ] Discussions

### Phase 7 — Offline

- [ ] PWA
- [ ] Offline lessons
- [ ] Offline MCQs
- [ ] IndexedDB
- [ ] Synchronization

### Phase 8 — Accounts

- [ ] Registration
- [ ] Login
- [ ] Profiles
- [ ] Cloud progress
- [ ] Cross-device synchronization

### Phase 9 — Advanced Learning

- [ ] Adaptive quizzes
- [ ] Weak-topic detection
- [ ] Personalized recommendations
- [ ] Spaced repetition
- [ ] Learning paths

### Phase 10 — Open Knowledge Network

- [ ] Community-created courses
- [ ] Translations
- [ ] Collaborative editing
- [ ] Public knowledge graph
- [ ] Open educational resources

## Contributing

Contributions are welcome.

You can contribute code, educational content, corrections, translations, design improvements, accessibility improvements, or documentation.

Before contributing, read:

```text
CONTRIBUTING.md
CODE_OF_CONDUCT.md
```

For educational content, contributors should prioritize:

- Accuracy
- Clarity
- Neutrality
- Proper structure
- Useful examples
- Reliable references where appropriate
- Accessibility

## License

OpenKnowledge is open source, released under the [Apache License 2.0](LICENSE).

Educational content and software code may use different licenses if the project chooses to separate them.

## Philosophy

OpenKnowledge is built around a simple idea:

> **Education should be understandable, accessible, open, and easy to contribute to.**

Instead of making learners watch hours of video, OpenKnowledge focuses on turning written knowledge into an interactive experience.

Instead of locking knowledge inside a proprietary platform, the content lives in structured, human-readable files.

Instead of requiring every contributor to understand the application code, contributors can add knowledge through simple Zolto and JSON structures.

```text
Knowledge
    ↓
Structured Content
    ↓
Open Source
    ↓
Interactive UI
    ↓
Practice
    ↓
Progress
    ↓
Better Understanding
```

**OpenKnowledge — Learn. Understand. Contribute.**
