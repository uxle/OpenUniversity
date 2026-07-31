# OpenUniversity

**OpenUniversity** is an open-source, text-first education platform designed to make learning **clear, interactive, visual, accessible, and easy to contribute to**.

No video courses are required.

Instead, OpenUniversity focuses on:

- High-quality text lessons
- Rich UI/UX and visual explanations
- Interactive learning
- Built-in MCQ engine
- Learning progress tracking
- Bookmarks
- Personal notes
- Fast content search
- Open knowledge contributions
- Accessibility
- Light, dark, and accessibility-friendly themes

> **Turn written knowledge into an interactive learning experience.**

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

OpenUniversity includes a dedicated search system for discovering knowledge.

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

OpenUniversity can track:

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

## Subject and Sub-Subject Details\n\nEducational metadata is stored in Zolto files.\n\n### Subject\n\n```text\nsrc/subjects/science/details.zl\n```\n\nExample:\n\n```zl\n# Science\n\n@subject {\n    id: science\n    title: "Science"\n    description: "Explore the natural world through scientific knowledge."\n}\n\n@subSubjects {\n    physics\n    chemistry\n    biology\n}\n```\n\n### Sub-Subject\n\n```text\nsrc/subjects/science/physics/details.zl\n```\n\nExample:\n\n```zl\n# Physics\n\n@subject {\n    id: physics\n    title: "Physics"\n    parent: science\n    description: "Study matter, energy, motion, forces and the laws of nature."\n}\n\n@lessons {\n    lesson1\n    lesson2\n}\n```\n\n## Lesson\n\nLessons use Zolto (`.zl`) so contributors can write rich educational content without deeply nested JSON.\n\n```text\nsrc/subjects/science/physics/lessons/lesson1.zl\n```\n\nA lesson can contain normal text plus structured educational blocks such as equations, diagrams, examples, definitions, tables, callouts, timelines, concept maps, and interactive components.\n\nExample:\n\n```zl\n# Introduction to Motion\n\nMotion is the change in position of an object over time.\n\n@definition {\n    Motion describes how an object's position changes\n    relative to a reference point.\n}\n\n@equation {\n    v = \\frac{d}{t}\n}\n\n@important {\n    Motion always depends on a reference frame.\n}\n\n@example {\n    A car travels 100 km in 2 hours.\n\n    @equation {\n        v = \\frac{100}{2}\n    }\n\n    answer: "50 km/h"\n}\n```\n\nThe Zolto engine parses the `.zl` source and renders it as accessible HTML/UI components.\n\n## MCQ\n\nMCQs remain JSON because they are structured machine-readable question data.\n\n```text\nsrc/subjects/science/physics/mcq/lesson1mcq.json\n```\n\nExample:\n\n```json\n{\n  "lessonId": "physics-motion-001",\n  "questions": [\n    {\n      "id": "q001",\n      "question": "What is motion?",\n      "options": [\n        "Change in position over time",\n        "Change in color",\n        "Increase in mass",\n        "Remaining stationary"\n      ],\n      "answer": 0,\n      "explanation": "Motion is a change in the position of an object with respect to time."\n    }\n  ]\n}\n```\n\n## Content Validation

OpenUniversity uses schemas and Zolto validation to make sure contributors don't accidentally break the learning system.

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

OpenUniversity is designed around the idea that **knowledge should be easy to contribute to**.

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
OpenUniversity publishes it
```

## Technology

OpenUniversity is designed to remain lightweight.

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

OpenUniversity should eventually support learning even when the user has limited or no internet access.

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

OpenUniversity is **text-first but not visually boring**.

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

OpenUniversity should support:

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

OpenUniversity should test both software and educational content.

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

- Basic HTML application
- Subject system
- Sub-subject system
- Zolto lesson system
- Basic lesson renderer

### Phase 2 — Learning

- MCQ engine
- Scoring
- Lesson completion
- Progress tracking

### Phase 3 — Personalization

- Bookmarks
- Notes
- History
- Learning dashboard

### Phase 4 — Discovery

- Search
- Filters
- Suggestions
- Related lessons

### Phase 5 — UX

- Advanced animations
- Responsive design
- Dark mode
- Accessibility
- Improved navigation

### Phase 6 — Community

- Contribution workflow
- Content validation
- Contributor profiles
- Reviews
- Discussions

### Phase 7 — Offline

- PWA
- Offline lessons
- Offline MCQs
- IndexedDB
- Synchronization

### Phase 8 — Accounts

- Registration
- Login
- Profiles
- Cloud progress
- Cross-device synchronization

### Phase 9 — Advanced Learning

- Adaptive quizzes
- Weak-topic detection
- Personalized recommendations
- Spaced repetition
- Learning paths

### Phase 10 — Open Knowledge Network

- Community-created courses
- Translations
- Collaborative editing
- Public knowledge graph
- Open educational resources

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

OpenUniversity is open source.

The project license should be defined in:

```text
LICENSE
```

Educational content and software code may use different licenses if the project chooses to separate them.

## Philosophy

OpenUniversity is built around a simple idea:

> **Education should be understandable, accessible, open, and easy to contribute to.**

Instead of making learners watch hours of video, OpenUniversity focuses on turning written knowledge into an interactive experience.

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

**OpenUniversity — Learn. Understand. Contribute.**
