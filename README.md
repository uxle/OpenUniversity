# OpenUniversity

OpenUniversity is an open-source, text-first education platform designed to make learning clear, interactive, visual, accessible, and easy to contribute to.

No video courses are required.

Instead, OpenUniversity focuses on:

- 📚 High-quality text lessons
- 🎨 Rich UI/UX and visual explanations
- 🧠 Interactive learning
- ❓ Built-in MCQ engine
- 📈 Learning progress tracking
- 🔖 Bookmarks
- 📝 Personal notes
- 🔎 Fast content search
- 🌐 Open knowledge contributions
- ♿ Accessibility
- 🌙 Light, dark, and accessibility-friendly themes

The goal is simple:

«Turn written knowledge into an interactive learning experience.»

---

## ✨ Features

📖 Text-First Courses

Courses are stored as structured JSON files instead of being locked inside a database or video platform.

Example:

src/
└── subjects/
    └── science/
        └── physics/
            └── lessons/
                └── lesson1.json

This makes educational content:

- Portable
- Version-controlled
- Easy to edit
- Easy to review
- Easy to translate
- Easy to contribute to

---

## 🧠 Interactive Lessons

Lessons aren't just plain paragraphs.

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

The lesson engine converts structured JSON into the final learning interface.

---

## ❓ MCQ Engine

Every lesson can optionally have its own question bank.

Example:

physics/
├── lessons/
│   └── lesson1.json
│
└── mcq/
    └── lesson1mcq.json

The MCQ engine can provide:

- Multiple-choice questions
- Instant feedback
- Explanations
- Score calculation
- Question progress
- Review mode
- Retry
- Performance tracking

---

## 🔎 Search

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

Example:

Search: "Newton's laws"

Results:

Science
└── Physics
    ├── Newton's Laws
    ├── Force
    └── Motion

---

## 🔖 Bookmarks

Users can bookmark important lessons and sections.

Example:

Bookmarks
│
├── Physics
│   ├── Newton's Laws
│   └── Motion
│
├── Mathematics
│   └── Quadratic Equations
│
└── Computer Science
    └── Algorithms

Bookmarks can eventually support folders and custom organization.

---

## 📝 Personal Notes

Users can create private notes while learning.

Example:

Newton's Laws

"Remember:
F = ma

Force increases when mass or acceleration increases."

Notes are associated with the user's learning environment rather than the public educational content.

---

## 📈 Progress Tracking

OpenUniversity can track:

- Lessons completed
- Subject progress
- MCQ scores
- Quiz attempts
- Learning streaks
- Recently studied lessons
- Bookmarked lessons
- Achievements

Example:

Physics

████████████░░░░ 75%

Lessons:       12 / 16
MCQ Score:     87%
Completed:     2026-07-31

---

## 🗂️ Project Structure

OpenUniversity/
│
├── index.html
├── README.md
├── LICENSE
├── CONTRIBUTING.md
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── app.js
│   │   ├── bootstrap.js
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── routes.js
│   │   └── state.js
│   │
│   ├── engines/
│   │   ├── subject-engine.js
│   │   ├── lesson-engine.js
│   │   ├── mcq-engine.js
│   │   ├── search-engine.js
│   │   ├── progress-engine.js
│   │   ├── bookmark-engine.js
│   │   ├── notes-engine.js
│   │   └── account-engine.js
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── subject/
│   │   ├── lesson/
│   │   ├── mcq/
│   │   ├── search/
│   │   ├── bookmarks/
│   │   ├── notes/
│   │   ├── progress/
│   │   └── account/
│   │
│   ├── pages/
│   │   ├── home.js
│   │   ├── subjects.js
│   │   ├── subject.js
│   │   ├── lesson.js
│   │   ├── mcq.js
│   │   ├── search.js
│   │   ├── bookmarks.js
│   │   ├── notes.js
│   │   ├── progress.js
│   │   └── profile.js
│   │
│   ├── services/
│   ├── storage/
│   ├── utils/
│   ├── accessibility/
│   ├── i18n/
│   │
│   ├── subjects/
│   │   ├── science/
│   │   ├── mathematics/
│   │   ├── computer-science/
│   │   ├── history/
│   │   ├── geography/
│   │   └── languages/
│   │
│   └── styles/
│
├── assets/
│   ├── illustrations/
│   ├── diagrams/
│   ├── backgrounds/
│   └── branding/
│
├── schemas/
├── tools/
├── tests/
│
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md

---

## 📚 Content Architecture

Educational content follows a simple hierarchy:

Subject
   │
   └── Sub-subject
          │
          ├── Lesson
          │
          ├── Lesson
          │
          └── Lesson

For example:

Science
└── Physics
    ├── Introduction to Physics
    ├── Motion
    ├── Force
    ├── Energy
    └── Newton's Laws

---

## 📄 Subject

Every subject can have a "details.json".

src/subjects/science/details.json

Example:

{
  "id": "science",
  "title": "Science",
  "description": "Explore the natural world through scientific knowledge.",
  "icon": "science",
  "subSubjects": [
    "physics",
    "chemistry",
    "biology"
  ]
}

---

## 📘 Sub-Subject

Example:

src/subjects/science/physics/details.json

{
  "id": "physics",
  "title": "Physics",
  "description": "Study matter, energy, motion, forces and the laws of nature.",
  "subject": "science",
  "lessons": 1
}

---

## 📖 Lesson

Example:

src/subjects/science/physics/lessons/lesson1.json

{
  "id": "physics-motion-001",
  "title": "Introduction to Motion",
  "description": "Learn the basic concept of motion.",
  "sections": [
    {
      "heading": "What is Motion?",
      "content": "Motion is the change in position of an object over time."
    }
  ],
  "keyPoints": [
    "Motion describes a change in position.",
    "Motion is measured relative to a reference point."
  ]
}

---

## ❓ MCQ

Example:

src/subjects/science/physics/mcq/lesson1mcq.json

{
  "lessonId": "physics-motion-001",
  "questions": [
    {
      "id": "q001",
      "question": "What is motion?",
      "options": [
        "Change in position over time",
        "Change in color",
        "Increase in mass",
        "Remaining stationary"
      ],
      "answer": 0,
      "explanation": "Motion is a change in the position of an object with respect to time."
    }
  ]
}

---

## 🧩 Content Validation

OpenUniversity uses JSON schemas to make sure contributors don't accidentally break the learning system.

schemas/
├── subject.schema.json
├── sub-subject.schema.json
├── lesson.schema.json
├── mcq.schema.json
├── user.schema.json
└── contribution.schema.json

Before content is accepted, automated validation can check:

- Required fields
- Valid JSON
- Duplicate IDs
- Broken references
- Invalid MCQ answers
- Missing lessons
- Invalid subject structure

---

## 🌍 Open Contributions

OpenUniversity is designed around the idea that knowledge should be easy to contribute to.

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

For example:

Add a lesson
     ↓
Create JSON
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

---

## 🛠️ Technology

OpenUniversity is designed to remain lightweight.

Core

HTML
CSS
JavaScript
JSON

Browser Storage

IndexedDB
localStorage

Optional Future Backend

REST API / GraphQL
Authentication
Database
Cloud synchronization

The first version can work without requiring a backend.

---

## 💾 Offline-Friendly Design

OpenUniversity should eventually support learning even when the user has limited or no internet access.

Possible architecture:

Browser
   │
   ├── HTML
   ├── CSS
   ├── JavaScript
   ├── JSON lessons
   │
   └── IndexedDB
        ├── Progress
        ├── Notes
        ├── Bookmarks
        └── MCQ results

A Progressive Web App architecture can later provide:

- Offline lessons
- Cached subjects
- Offline MCQs
- Installable application
- Background synchronization

---

## 🎨 UI/UX Philosophy

OpenUniversity is text-first but not visually boring.

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

The goal is:

«Maximum clarity, not maximum decoration.»

---

## ♿ Accessibility

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

---

## 🌐 Internationalization

The platform should eventually support multiple languages.

src/i18n/
├── i18n.js
├── en.json
└── hi.json

Educational content can eventually have language variants:

lesson1.en.json
lesson1.hi.json
lesson1.es.json

---

## 🔐 User Data

Public educational content and private user data should remain separate.

Public

Subjects
Lessons
MCQs
Definitions
Diagrams

Private

Progress
Bookmarks
Notes
Preferences
Quiz history
Account information

For a frontend-only version:

IndexedDB

can store personal learning data locally.

A future server-based version can synchronize this data across devices.

---

## 🔍 Search Architecture

Search can eventually use a generated index:

src/data/search-index.json

Example:

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

Potential ranking factors:

1. Exact title match
2. Keyword match
3. Subject match
4. Lesson relevance
5. Content relevance
6. Popularity
7. User history

---

## 📊 Learning Analytics

The platform can locally calculate useful learning statistics:

Learning Statistics
│
├── Lessons completed
├── MCQs answered
├── Accuracy
├── Study streak
├── Subject progress
├── Weak topics
└── Strong topics

The purpose should be to help learners, not to manipulate them.

---

## 🧪 Testing

OpenUniversity should test both software and educational content.

tests/
├── engines/
├── components/
├── content/
└── integration/

Examples:

MCQ Engine
    ↓
Question loading
    ↓
Answer validation
    ↓
Score calculation
    ↓
Result generation

---

## 🔧 Development Tools

The "tools/" directory contains scripts that help maintain the knowledge base.

tools/
├── validate-content.js
├── build-search-index.js
├── generate-registry.js
├── check-links.js
└── check-duplicates.js

These tools can automatically:

- Validate lessons
- Validate MCQs
- Generate search indexes
- Find duplicate IDs
- Find broken references
- Generate subject registries

---

## 🚀 Future Roadmap

Phase 1 — Foundation

- Basic HTML application
- Subject system
- Sub-subject system
- JSON lesson system
- Basic lesson renderer

Phase 2 — Learning

- MCQ engine
- Scoring
- Lesson completion
- Progress tracking

Phase 3 — Personalization

- Bookmarks
- Notes
- History
- Learning dashboard

Phase 4 — Discovery

- Search
- Filters
- Suggestions
- Related lessons

Phase 5 — UX

- Advanced animations
- Responsive design
- Dark mode
- Accessibility
- Improved navigation

Phase 6 — Community

- Contribution workflow
- Content validation
- Contributor profiles
- Reviews
- Discussions

Phase 7 — Offline

- PWA
- Offline lessons
- Offline MCQs
- IndexedDB
- Synchronization

Phase 8 — Accounts

- Registration
- Login
- Profiles
- Cloud progress
- Cross-device synchronization

Phase 9 — Advanced Learning

- Adaptive quizzes
- Weak-topic detection
- Personalized recommendations
- Spaced repetition
- Learning paths

Phase 10 — Open Knowledge Network

- Community-created courses
- Translations
- Collaborative editing
- Public knowledge graph
- Open educational resources

---

## 🤝 Contributing

Contributions are welcome.

You can contribute code, educational content, corrections, translations, design improvements, accessibility improvements, or documentation.

Before contributing, read:

CONTRIBUTING.md
CODE_OF_CONDUCT.md

For educational content, contributors should prioritize:

- Accuracy
- Clarity
- Neutrality
- Proper structure
- Useful examples
- Reliable references where appropriate
- Accessibility

---

## 📜 License

OpenUniversity is open source.

The project license should be defined in:

LICENSE

Educational content and software code may use different licenses if the project chooses to separate them.

---

## 🌱 Philosophy

OpenUniversity is built around a simple idea:

«Education should be understandable, accessible, open, and easy to contribute to.»

Instead of making learners watch hours of video, OpenUniversity focuses on turning written knowledge into an interactive experience.

Instead of locking knowledge inside a proprietary platform, the content lives in structured, human-readable files.

Instead of requiring every contributor to understand the application code, contributors can add knowledge through simple JSON structures.

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

OpenUniversity — Learn. Understand. Contribute.